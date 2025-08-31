const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { SigningCosmWasmClient, CosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { calculateFee, GasPrice } = require('@cosmjs/stargate');
const http = require('http');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
// Lấy URL của app từ Render dashboard
const APP_URL = '';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ping mỗi 10 phút để không sleep
setInterval(async () => {
    try {
        const response = await fetch(APP_URL);
        console.log(`🏓 Keep-alive: ${new Date().toLocaleString()}`);
    } catch (error) {
        console.log('❌ Ping failed:', error.message);
    }
}, 10 * 60 * 1000); // 10 phút

// Tạo HTTP server đơn giản
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OROSWAP BOT is running!');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
console.clear();
console.log("\x1b[35m%s\x1b[0m", "============================================");
console.log("\x1b[36m%s\x1b[0m", "      OROSWAP BOT - VÍ KEPLR/LEAP       ");
console.log("\x1b[36m%s\x1b[0m", "               VELHUST                   ");
console.log("\x1b[35m%s\x1b[0m", "============================================\n");

// Định nghĩa trực tiếp mảng MNEMONICS, cách nhau dấu phẩy
const MNEMONICS = [
  "target motor doll end olive shadow tray glimpse large absent daughter spoon",
].map(m => m.trim());

console.log(`✅ Đã load ${MNEMONICS.length} ví trực tiếp từ code`);

const CONFIG = {
    rpcEndpoint: "https://public-zigchain-testnet-rpc.numia.xyz",
    apiEndpoint: "https://public-zigchain-testnet-lcd.numia.xyz",
    faucetEndpoint: "https://faucet.zigchain.com",
    chainId: "zig-test-2",
    zigDenom: "uzig",
    oroDenom: "coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro",
    swapContract: "zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg",
    gasPrice: GasPrice.fromString("0.025uzig"),
};

function randomAmount() {
    const min = 0.0001;
    const max = 0.0009;
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(4));
}

const ZIG_AMOUNT = randomAmount();
const ORO_AMOUNT = randomAmount();

function randomLiqValueAsString() {
  const min = 0.00001;
  const max = 0.00009;
  const random = Math.random() * (max - min) + min;
  return random.toFixed(5); // Chuỗi có 4 chữ số thập phân
}

const LIQ_ORO = randomLiqValueAsString();
const LIQ_ZIG = randomLiqValueAsString();

const delay = async (ms) => {
    process.stdout.write(`\r⏳ Đang chờ ${ms / 1000} giây... `);
    await new Promise(res => setTimeout(res, ms));
    console.log("✅ Hoàn thành chờ");
};

async function getBalance(mnemonic, denom) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "zig" });
    const [account] = await wallet.getAccounts();
    const client = await CosmWasmClient.connect(CONFIG.rpcEndpoint);
    const balance = await client.getBalance(account.address, denom);
    return { address: account.address, amount: balance.amount, formatted: Number(balance.amount) / 1e6 };
}

async function getBeliefPrice(denom, amount) {
    const client = await CosmWasmClient.connect(CONFIG.rpcEndpoint);
    const sim = await client.queryContractSmart(CONFIG.swapContract, {
        simulation: {
            offer_asset: {
                amount,
                info: { native_token: { denom: denom } }
            }
        }
    });
    const beliefPrice = (BigInt(amount) * BigInt(1e6)) / BigInt(sim.return_amount);
    return (Number(beliefPrice) / 1e6).toFixed(18);
}

async function swap(mnemonic, amount, fromDenom, toDenom) {
    try {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "zig" });
        const [account] = await wallet.getAccounts();
        const client = await SigningCosmWasmClient.connectWithSigner(CONFIG.rpcEndpoint, wallet, {
            gasPrice: CONFIG.gasPrice, chainId: CONFIG.chainId
        });

        const baseAmount = Math.floor(amount * 1e6).toString();
        const beliefPrice = await getBeliefPrice(fromDenom, baseAmount);
        const fee = calculateFee(320000, CONFIG.gasPrice);

        const msg = {
            swap: {
                belief_price: beliefPrice,
                max_spread: "0.005",
                offer_asset: {
                    amount: baseAmount,
                    info: { native_token: { denom: fromDenom } }
                }
            }
        };

        const result = await client.execute(account.address, CONFIG.swapContract, msg, fee, "Swap", [
            { denom: fromDenom, amount: baseAmount }
        ]);

        const fromName = fromDenom === CONFIG.zigDenom ? "ZIG" : "ORO";
        const toName = toDenom === CONFIG.zigDenom ? "ZIG" : "ORO";
        console.log(`\n✅ Swap ${fromName} → ${toName} thành công! TX: ${result.transactionHash}`);
        console.log(`🔍 https://zigscan.org/tx/${result.transactionHash}`);
    } catch (e) {
        console.error(`❌ Swap thất bại:`, e.message);
    }
}

// Lấy tỷ lệ pool hiện tại (ZIG/ORO)
async function getPoolRatio() {
    const client = await CosmWasmClient.connect(CONFIG.rpcEndpoint);
    const pool = await client.queryContractSmart(CONFIG.swapContract, { pool: {} });

    const oroAsset = pool.assets.find(a => a.info.native_token?.denom === CONFIG.oroDenom);
    const zigAsset = pool.assets.find(a => a.info.native_token?.denom === CONFIG.zigDenom);

    const oroAmount = Number(oroAsset.amount);
    const zigAmount = Number(zigAsset.amount);

    const ratio = zigAmount / oroAmount; // số ZIG cho 1 ORO
    return { oroAmount, zigAmount, ratio };
}

async function addLiquidity(mnemonic, amountUoro, _amountUzig) {
    try {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "zig" });
        const [account] = await wallet.getAccounts();
        const client = await SigningCosmWasmClient.connectWithSigner(CONFIG.rpcEndpoint, wallet, {
            gasPrice: CONFIG.gasPrice, chainId: CONFIG.chainId
        });

        // Query pool để tính đúng tỷ lệ
        const { ratio } = await getPoolRatio();

        // Convert ORO thành base unit
        const uoroBaseAmount = Math.floor(Number(amountUoro) * 1e6);

        // Tính lượng ZIG tương ứng theo tỷ lệ pool
        const uzigBaseAmount = Math.floor(uoroBaseAmount * ratio);

        // Nếu ra 0 thì bỏ qua
        if (uoroBaseAmount <= 0 || uzigBaseAmount <= 0) {
            console.log("⚠️ Bỏ qua vì số lượng quá nhỏ.");
            return;
        }

        const msg = {
            provide_liquidity: {
                assets: [
                    {
                        amount: uoroBaseAmount.toString(),
                        info: { native_token: { denom: CONFIG.oroDenom } }
                    },
                    {
                        amount: uzigBaseAmount.toString(),
                        info: { native_token: { denom: CONFIG.zigDenom } }
                    }
                ],
                slippage_tolerance: "0.05" // 1% thôi là đủ
            }
        };

        const funds = [
            { denom: CONFIG.oroDenom, amount: uoroBaseAmount.toString() },
            { denom: CONFIG.zigDenom, amount: uzigBaseAmount.toString() }
        ];

        const fee = calculateFee(320000, CONFIG.gasPrice);

        const result = await client.execute(account.address, CONFIG.swapContract, msg, fee, "Provide Liquidity", funds);

        console.log(`\n✅ Cung cấp thanh khoản cặp ORO/ZIG thành công! TX: ${result.transactionHash}`);
        console.log(`🔍 https://zigscan.org/tx/${result.transactionHash}`);
    } catch (err) {
        console.error("❌ Thêm thanh khoản thất bại:", err.message);
    }
}

// Hàm yêu cầu token từ faucet
async function requestFaucet(mnemonic) {
    try {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "zig" });
        const [account] = await wallet.getAccounts();
        const address = account.address;

        console.log(`📤 Yêu cầu faucet cho địa chỉ: ${address}`);
        
        const response = await fetch(`${CONFIG.faucetEndpoint}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: address })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(`✅ Faucet thành công cho ${address}!`);
            console.log(`🔍 TX: ${result.tx_hash}`);
        } else {
            console.error(`❌ Faucet thất bại: ${result.message || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error(`❌ Lỗi khi yêu cầu faucet: ${error.message}`);
    }
}

// Hàm xử lý một ví đơn lẻ (bao gồm tất cả swap và addLiquidity cho ví đó)
async function processWallet(mnemonic, walletIndex) {
    console.log(`\n📱 Xử lý ví ${walletIndex + 1}: ${mnemonic.slice(0, 10)}...`);

    for (let i = 0; i < 50; i++) {
        await swap(mnemonic, ZIG_AMOUNT, CONFIG.zigDenom, CONFIG.oroDenom);
        await delay(5000);
    }

    for (let i = 0; i < 200; i++) {
        console.log("\n💧 Đang thêm thanh khoản...");
        await addLiquidity(mnemonic, LIQ_ORO, LIQ_ZIG);
        await delay(5000);
    }
}

// Hàm hiển thị menu và xử lý lựa chọn
async function showMenu() {
    console.log("\n=== MENU ===");
    console.log("1. Yêu cầu token từ faucet");
    console.log("2. Chạy bot swap và thêm thanh khoản");
    console.log("3. Thoát");

    rl.question("Nhập lựa chọn (1-3): ", async (choice) => {
        switch (choice) {
            case '1':
                for (let i = 0; i < MNEMONICS.length; i++) {
                    console.log(`\n🚀 Yêu cầu faucet cho ví ${i + 1}`);
                    await requestFaucet(MNEMONICS[i]);
                    await delay(5000);
                }
                showMenu();
                break;
            case '2':
                await runBot();
                showMenu();
                break;
            case '3':
                console.log("👋 Đã thoát chương trình!");
                rl.close();
                server.close();
                break;
            default:
                console.log("❌ Lựa chọn không hợp lệ, vui lòng chọn lại!");
                showMenu();
                break;
        }
    });
}

async function runBot() {
    for (let liqCount = 0; liqCount < 1000000000; liqCount++) {
        console.log(`\n=== Chu kỳ Swap thứ ${liqCount + 1} ===`);
        
        // Chia mảng ví thành các batch 10 ví
        for (let batchStart = 0; batchStart < MNEMONICS.length; batchStart += 20) {
            const batch = MNEMONICS.slice(batchStart, batchStart + 20);
            console.log(`\n🚀 Chạy batch ví từ ${batchStart + 1} đến ${batchStart + batch.length}`);
            
            // Chạy parallel 10 ví trong batch bằng Promise.all
            await Promise.all(batch.map((mnemonic, index) => 
                processWallet(mnemonic, batchStart + index)
            ));
            
            // Delay giữa các batch để tránh overload RPC
            if (batchStart + 20 < MNEMONICS.length) {
                await delay(10000); // 10 giây giữa batch
            }
        }
    }
}

// Bắt đầu chương trình
showMenu();