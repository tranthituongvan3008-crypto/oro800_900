const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { SigningCosmWasmClient, CosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { calculateFee, GasPrice } = require('@cosmjs/stargate');
const http = require('http');

const PORT = process.env.PORT || 3000;
const APP_URL = 'https://oro800-900.onrender.com'; // 请在此处填写您的 Render 应用 URL（如果需要 keep-alive）

// Ping mỗi 10 phút để không sleep (如果 APP_URL 为空则不执行)
setInterval(async () => {
    if (!APP_URL) return;
    try {
        await fetch(APP_URL);
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
  " point one squirrel real net stumble maid sorry atom wink deal south",
" verify tomorrow ticket acid cheap rice scheme course crew stuff buffalo deliver",
" carry clay apart hub puzzle random chicken glove walk duck inside frozen",
" narrow soap ladder region amount human news improve inmate raven cool evidence",
" congress crater fun glove diesel lake slam blouse little mobile napkin arrow",
" abandon word crush double suffer usage account joy ship modify tobacco label",
" chief rally hood resource coin allow staff time deny blush fluid hedgehog",
" excuse soup celery sight mixed winner shaft budget slide slow trigger near",
" curve prison auto genius rapid refuse orphan tongue comic rigid fashion express",
" luxury hunt spin bitter health notice coin west consider change patient fence",
" junk drill lucky cool cherry whale blossom lion sample crouch twice wasp",
" effort taxi glare deputy double grain sun forget seminar alarm order indoor",
" today shield flip bind neither industry someone amateur field work beauty wear",
" pet pigeon service bench fog december talent clerk lazy behave way museum",
" almost throw stove feature process woman essence betray own miss jealous material",
" citizen accident mass bring cousin merit unit pill cream casual despair gaze",
" hidden pipe deal punch piano trap sibling arm cereal trumpet electric drastic",
" prison merit apple impose fever caught play visa quantum test priority fame",
" aisle ensure exercise apple grape common promote camera girl witness execute venue",
" physical unlock fatal chat next radio crucial follow pitch illegal dawn maid",
" unaware chair pact yard play during manage utility deputy sing boring sound",
" twin gravity film can distance stool someone return drop dust jar gloom",
" post device click trade cat cart glimpse wedding face speed margin educate",
" decorate whisper paddle alert laptop inmate sample embark much swim play habit",
" vivid electric journey march camera cotton hint regret close ketchup people sadness",
" twenty expire shock stamp matter ridge swear rare inhale shoulder crawl rabbit",
" mansion trade distance frequent cable fragile select merge deposit someone cousin enjoy",
" away canal argue coast model love arrow relax upper firm donkey era",
" gospel island price bridge winner slot before armed state another toilet shift",
" primary orient mesh shock avocado crouch peanut gown casual clog kit actor",
" plunge spray cushion uncover funny evil test delay frozen table stumble weekend",
" long match forward torch know keep layer steel february write way garage",
" pride deposit wealth between pyramid mixture reject used clog stick rib ketchup",
" museum rice series clump trap food wave riot place uphold exchange feed",
" major wing three always wealth search rabbit awake knife version normal chair",
" snake satisfy tower repair push amount believe march pen help noble lyrics",
" always abuse dress dutch warfare device remain deliver trouble tired pioneer hammer",
" until choice uncover blossom street diesel gap online welcome wool inflict layer",
" science fabric spatial material tragic disease walnut bird tired fee frequent burger",
" ask silver pledge ankle infant shine photo elbow shift food feel space",
" key core wrist erupt swim umbrella approve law suspect margin romance media",
" reflect hand recipe conduct benefit adapt glare donor spirit nothing pair math",
" enact total parent cereal curtain bomb pig alarm found leader reward cliff",
" genuine provide unveil crawl nest bike promote sample merry recall gather fat",
" argue around under eyebrow fury ranch stove fiscal drastic assist interest cute",
" shoulder fee cart release forum swamp wash odor promote simple crane potato",
" accuse doll make cluster elegant million save giant print dress below eyebrow",
" pumpkin echo goddess salon still jaguar awkward language turtle manage trick cake",
" area sweet bid original drop gospel ghost account stamp swift trust edge",
" guitar hawk burst gather jungle galaxy ginger title spare shift unlock cry",
" churn one cool upset then nation measure unhappy muffin recycle weather nice",
" napkin reveal battle praise copy avoid curve current sun belt notice addict",
" before onion manual resemble merit gift shine box soldier stone wear machine",
" stone lazy knee carry boil glide better tennis master loan expand good",
" high soldier night rich rally crawl uphold sister shield around hawk release",
" bounce erase best tunnel expect price lunch dinosaur theory palm quiz maid",
" stool talent where already copy syrup wrestle suit heavy duty just guide",
" rocket parrot rookie vacuum convince elder merry various congress custom today rapid",
" doll cargo mimic design merry assist ribbon tiger alter view moral novel",
" pig dismiss tennis evoke crucial frog powder execute victory tennis this envelope",
" when use observe north path flavor ring mechanic midnight once day receive",
" circle insect wool axis salute problem giggle sense orchard vendor hill paddle",
" else exercise culture fatal silk wolf fame midnight dove weekend faint grab",
" absurd jealous tobacco acquire wagon hire amateur tuition same art pelican excess",
" foot lucky stamp jar tiger ship capital until air oak crash shell",
" brother defy use gown news hawk govern camera dish innocent tone claim",
" ride parent iron stamp unaware census unlock example trial quit any put",
" fiscal thumb key trap once subway dynamic chicken album reunion pride pupil",
" cube turkey hospital crawl inquiry hammer toe cable memory climb until mom",
" once twist illegal tobacco promote vehicle burger neutral clarify slogan answer work",
" tape daring family seed fall duck solution sunny fly figure enhance flip",
" power oyster rather injury bulk local mango breeze access episode forward steel",
" hello poverty gym helmet royal august pigeon clerk correct accuse depart mimic",
" typical gun sort virtual spatial abstract lazy olympic member foam luxury motor",
" question forest fish rather car daring foil test bean glow host sort",
" priority ecology thought flame uphold credit goat brave ten coconut lift pizza",
" excess december cattle brave seven vessel extend siren aerobic deposit album mass",
" egg tone chef silk slam diamond fragile yellow sign country ladder someone",
" liar snack method rhythm clinic ride dry punch obtain parent polar already",
" useless measure caution funny fall embrace tornado satisfy eager deposit tribe ball",
" ancient earth flame rural effort amazing quarter laundry enforce typical shoot outdoor",
" disease chaos grow have grunt ketchup desert thumb fish leader swap over",
" surprise color funny angry paper swallow solve rose joy nerve chef liquid",
" heavy spirit cattle age hair brass example glide produce field summer liberty",
" match frog virus dizzy always myself topple wood front illness token rude",
" calm toward orphan dove unit hurry once almost pumpkin radio rescue action",
" razor unit finger stumble average earth cluster copper rotate avocado maze enhance",
" identify regret worry cabbage noise rich unit shoot situate occur top title",
" grant pulse dad card cabbage outer alley gain cool evil amount item",
" supply spy squeeze snake assist double blast attract drama broccoli speed crew",
" zoo weird shock smoke invest verb tortoise void donor program fiscal minute",
" swift coconut seat regular boy goddess deal axis blast month able issue",
" fresh cram convince museum arrow fee tortoise female detail belt evidence spice",
" kiss fragile issue photo charge model crumble make distance champion voyage cheese",
" inmate merry spy frown element render code write depart tortoise panel second",
" inner roast wise must merit thumb rent possible bracket bus super adult",
" motion much huge expose want dash place kitten address attract key humble",
" soldier kangaroo beef wisdom orchard trim parrot insane rare neck among describe",
" until text pioneer media panda sniff drama item olympic cattle visa return",
" toss antique mad fitness rose glow behave hint clap identify vague ignore",
" garden effort report sleep aspect earth unfold reason tourist pretty bulk mango",
" renew outdoor plug lazy guard glue iron sand situate sign river initial",
" theme keep foam matter glory future story tongue capable acid gravity want",
" project gym fruit cactus jazz action lonely head agree where climb peace",
" pupil rent shield game bike cream tape calm canvas fossil flag retreat",
" symptom only mutual notable faint similar breeze inhale stamp cargo among loop",
" camera nasty goose off cliff quarter dizzy harsh child swift manual oval",
" swamp device arch teach stadium people shy horse awesome lamp noble possible",
" kid profit sun since car mesh stock endorse hard crack pioneer enforce",
" supreme page supreme history cart joke spawn lawsuit quarter corn rubber endorse",
" lab library point horse wine drink caught mention apology wealth little abstract",
" elite brown universe rocket town half one buyer salmon utility step mad",
" tired border train asthma dash appear answer poem text leg donate vapor",
" churn polar dentist draft lamp fox exact media orange glide muscle amused",
" polar wrong enforce loan twin solution slight hawk accident element shuffle sponsor",
" rain valley decorate inquiry predict quit chuckle cry brother soccer obey venture",
" member vivid fruit cannon design mixture burger bike position detect trend face",
" law version tray child wrong record swim black letter multiply pride theme",
" reason inform abstract charge range evolve vacuum pipe month illness october bike",
" spring spray person hill cost page modify give exhibit release sleep chimney",
" laugh voyage permit castle midnight announce act stick screen sun crawl stairs",
" army public ice dentist pencil bulb lens artwork vault canoe tool typical",
" system provide hair silent vote thumb garment theory siren cram small work",
" style nose ribbon blossom idle bamboo carbon client soap sleep fragile delay",
" knock can grant shrimp indoor wool cactus eight swarm grab flush lecture",
" door genre stage square media miss cushion among wing culture magnet thrive",
" weekend guard kangaroo faculty east floor alone lazy permit neglect similar cover",
" include chase cook learn monkey frozen replace emerge view amazing cloud virus",
" silent giant surround dinosaur topple moon filter curious wife noble grain tortoise",
" business federal crawl honey duck crazy verify floor dwarf client buddy radar",
" dog luggage confirm roof always negative gown shock remember polar dilemma sorry",
" heart sort spoon donate empower cousin funny witness behind equal remove celery",
" goddess pull increase anger patrol dizzy gorilla bleak satoshi rule unknown script",
" machine deal guide vanish job museum comfort claw rebuild judge cycle valve",
" romance cradle wash sudden side smile bus inflict loop rule dynamic hood",
" ramp guard mandate random strategy dash mask eight hint swear clutch axis",
" jeans ozone utility october assault horror airport local human usage good stand",
" soda input resource father yard hero tape narrow library pear afraid first",
" maze canyon problem relief magnet board broccoli install corn during tell addict",
" employ ticket report task wood opinion memory boost breeze area essence tissue",
" calm shield choose imitate annual hockey adjust kangaroo grit swim destroy erupt",
" edge effort health summer proof usage hero employ reject bind mystery exact",
" corn insect decorate axis already census hip fiction empower holiday elite supply",
" net radio pottery design canvas assist common bike degree scene canoe anger",
" urban electric wire genre buffalo fitness rookie axis ball vault vanish assault",
" vessel kind stove plunge what cruise youth reward gas salon ugly squeeze",
" chase inch dial powder warrior tip erosion edge doctor escape artist share",
" parent bulb identify energy type dream birth crash loan rack riot bar",
" panic zone black hurdle lottery you suit leisure virtual apology derive rude",
" autumn sunset gain auto fat grass basic habit hour trophy wedding long",
" add sugar hunt broken giant moment flash net accuse order decrease frown",
" injury client tank paddle bind skull oak lamp wagon cook code bullet",
" payment miss forget bargain episode december because salad lobster gesture depth bullet",
" swap agent corn puzzle teach mango camera relief sleep split hotel baby",
" quality game win license rigid buddy device script million vacant amount soldier",
" improve palm random gossip private chicken snap cement vintage hill fog cruel",
" vast raccoon own ketchup hockey cry expose journey poverty ordinary high ladder",
" mail valley alone regular opinion census front weasel together friend body offer",
" south joy energy simple file dice demise burger hope judge motor skin",
" lesson major thing book path kitten better domain inhale cabbage champion lonely",
" year piece never dumb payment wealth cheese tube man skill myth earn",
" drill sun decide chicken sure false series mix paper tortoise aerobic clay",
" paddle position swap sample swap van april rebuild where sketch oil unlock",
" segment struggle fantasy puzzle december plug resist involve slab flight version rain",
" rescue share poet float gain pistol physical normal chuckle clever blossom riot",
" mean crash anchor chest october language allow gossip tide weird naive miracle",
" immune hello brown layer student opinion evolve river shadow mandate fragile unlock",
" balcony amazing mechanic symptom final grow auto hamster chapter hill insane obscure",
" mouse essay blind usual legend that broom noble hip learn bag umbrella",
" asset afford pipe gravity update follow police city apology approve opinion media",
" prison approve dentist cool scissors narrow dove imitate iron fury must dirt",
" blouse city photo double derive author spoil box raccoon extend educate betray",
" world winter dinner soup release mix truck island armor stuff local second",
" primary diet edit renew pull host eternal peace pilot velvet defy fringe",
" picture roast camp size inquiry road dirt nurse park museum bullet cannon",
" isolate truly couple token benefit horse vault bomb lecture girl virtual ritual",
" trim mandate length mask dice time road veteran put patrol grace swing",
" face organ achieve chimney ability bench dwarf range finish run border accuse",
" latin two noise aunt sweet tag toy defense upon plug vehicle price",
" burden fiction ripple month always split another banner decrease found vague tray",
" chapter decrease talk recall oppose spice broken announce fluid body solution cabin",
" ceiling asset pool bid pair tornado intact foil load emerge spider token",
" unique oven seed enlist benefit edit thought cross critic hurt traffic social",
" silent roast subway goddess october type wage mom crane blossom bamboo spoil",
" author mango silent judge rigid company drive army include improve access repeat",
" crazy random canvas reveal autumn secret fatal fiscal welcome dust walk daughter",
" recycle foil predict empty strike ugly squeeze million struggle alpha inner nothing",
" minor always uncover tiger tourist poverty sand brother wreck exclude wrestle hold",
" curious regular source middle moment damage destroy feature weapon circle lamp morning",
" army economy zebra start castle suspect giant rebuild render essay umbrella arrive",
" travel hurt civil flip climb gun tackle apology turkey document fragile bar",
" dizzy fatigue pole poet royal chair major fan renew poet bounce knife",
" dinner empty vessel public enact gym north surprise fringe air theory sleep",
" twenty exercise girl tube subway bid permit leaf chicken april file notice",
" panther fetch upset unlock hub opinion enemy share street chapter attract captain",
" front inquiry arrest immense tube later snake balance immune junior capable chair",
" custom clever pilot equip tip december scissors swallow relax fiscal obey ginger",
" mango gym fiber embark payment people mansion history rose width oyster net",
" chalk wonder flip roast exclude leader deposit kick faint gold fluid lucky",
" cup deal orphan endorse rare alter embody amount lend subject deal jaguar",


].map(m => m.trim());

if (MNEMONICS.length === 0 || (MNEMONICS.length === 1 && MNEMONICS[0] === '')) {
    console.error("❌ LỖI: Không tìm thấy mnemonic nào. Vui lòng thêm mnemonic vào mảng MNEMONICS trong code.");
    process.exit(1);
}

console.log(`✅ Đã load ${MNEMONICS.length} ví trực tiếp từ code`);

const CONFIG = {
    rpcEndpoint: "https://public-zigchain-testnet-rpc.numia.xyz", // Đảm bảo URL chính xác và không có khoảng trắng thừa
    chainId: "zig-test-2",
    zigDenom: "uzig",
    oroDenom: "coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro",
    swapContract: "zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg",
    gasPrice: GasPrice.fromString("0.025uzig"),
    minZigBalance: 2.0, // Số dư ZIG tối thiểu cần có để thực hiện chu kỳ
    targetBatchSize: 20  // Số lượng ví đủ điều kiện muốn chạy cùng lúc
};

// --- Hàm tiện ích ---

function randomAmount() {
    const min = 0.0002;
    const max = 0.0009;
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(4));
}

function randomLiqValueAsString() {
  const min = 0.00001;
  const max = 0.00005;
  const random = Math.random() * (max - min) + min;
  return random.toFixed(5);
}

const delay = async (ms) => {
    process.stdout.write(`\r⏳ Đang chờ ${ms / 1000} giây... `);
    await new Promise(res => setTimeout(res, ms));
    console.log("✅ Hoàn thành chờ");
};

// --- Hàm tương tác với blockchain ---

async function getBalance(mnemonic, denom) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "zig" });
    const [account] = await wallet.getAccounts();
    const client = await CosmWasmClient.connect(CONFIG.rpcEndpoint);
    const balance = await client.getBalance(account.address, denom);
    return { address: account.address, amount: balance.amount, formatted: Number(balance.amount) / 1e6 };
}

async function getBeliefPrice(denom, amount) {
    const client = await CosmWasmClient.connect(CONFIG.rpcEndpoint);
    try {
        const sim = await client.queryContractSmart(CONFIG.swapContract, {
            simulation: {
                offer_asset: {
                    amount: amount.toString(),
                    info: { native_token: { denom: denom } }
                }
            }
        });
        // Sử dụng BigInt để tính toán chính xác belief_price
        const beliefPrice = (BigInt(amount) * BigInt(1e6)) / BigInt(sim.return_amount);
        return (Number(beliefPrice) / 1e6).toFixed(18);
    } catch (error) {
        console.error("Lỗi khi lấy belief price:", error.message);
        // Trả về một giá trị mặc định hợp lý nếu không lấy được
        return "1.0";
    }
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
                max_spread: "0.005", // 0.5% spread
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
        // Ghi chú: Liên kết explorer có thể cần điều chỉnh nếu định dạng khác
        // console.log(`🔍 https://zigscan.org/tx/${result.transactionHash}`);
    } catch (e) {
        console.error(`❌ Swap thất bại (${mnemonic.slice(0, 10)}...):`, e.message);
    }
}

// Lấy tỷ lệ pool hiện tại (ZIG/ORO)
async function getPoolRatio() {
    const client = await CosmWasmClient.connect(CONFIG.rpcEndpoint);
    try {
        const pool = await client.queryContractSmart(CONFIG.swapContract, { pool: {} });

        const oroAsset = pool.assets.find(a => a.info.native_token?.denom === CONFIG.oroDenom);
        const zigAsset = pool.assets.find(a => a.info.native_token?.denom === CONFIG.zigDenom);

        if (!oroAsset || !zigAsset) {
             throw new Error("Không tìm thấy tài sản ORO hoặc ZIG trong pool");
        }

        const oroAmount = Number(oroAsset.amount);
        const zigAmount = Number(zigAsset.amount);

        const ratio = zigAmount / oroAmount; // số ZIG cho 1 ORO
        return { oroAmount, zigAmount, ratio };
    } catch (error) {
         console.error("Lỗi khi lấy tỷ lệ pool:", error.message);
         // Trả về tỷ lệ mặc định nếu lỗi
         return { ratio: 1.0 };
    }
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
        const uoroAmount = Number(amountUoro);
        const uoroBaseAmount = Math.floor(uoroAmount * 1e6);

        // Tính lượng ZIG tương ứng theo tỷ lệ pool
        const uzigRequired = uoroAmount * ratio;
        const uzigBaseAmount = Math.floor(uzigRequired * 1e6);

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
                slippage_tolerance: "0.05" // 5% slippage tolerance
            }
        };

        const funds = [
            { denom: CONFIG.oroDenom, amount: uoroBaseAmount.toString() },
            { denom: CONFIG.zigDenom, amount: uzigBaseAmount.toString() }
        ];

        const fee = calculateFee(320000, CONFIG.gasPrice); // Tăng gas cho liquidity

        const result = await client.execute(account.address, CONFIG.swapContract, msg, fee, "Provide Liquidity", funds);

        console.log(`\n✅ Cung cấp thanh khoản cặp ORO/ZIG thành công! TX: ${result.transactionHash}`);
        // console.log(`🔍 https://zigscan.org/tx/${result.transactionHash}`);
    } catch (err) {
        console.error("❌ Thêm thanh khoản thất bại:", err.message);
    }
}

// --- Hàm xử lý logic bot ---

// Hàm kiểm tra số dư cho một ví
async function checkWalletBalance(mnemonic, walletIndex) {
    try {
        const balanceInfo = await getBalance(mnemonic, CONFIG.zigDenom);
        const isEligible = balanceInfo.formatted >= CONFIG.minZigBalance;
        console.log(`📱 Ví ${walletIndex + 1} (${mnemonic.slice(0, 10)}...) - ZIG: ${balanceInfo.formatted.toFixed(6)}, đủ điều kiện: ${isEligible ? 'Có' : 'Không'}`);
        return { mnemonic, index: walletIndex, isEligible, balance: balanceInfo.formatted };
    } catch (err) {
        console.error(`❌ Kiểm tra số dư ví ${walletIndex + 1} thất bại:`, err.message);
        // Giả định không đủ điều kiện nếu có lỗi
        return { mnemonic, index: walletIndex, isEligible: false, balance: 0 };
    }
}

// Hàm xử lý các hoạt động (swap, addLiq) cho một ví đủ điều kiện
async function processEligibleWallet(walletData) {
    const { mnemonic, index } = walletData;
    console.log(`\n🚀 Bắt đầu xử lý ví đủ điều kiện ${index + 1}: ${mnemonic.slice(0, 10)}...`);

    // Tạo giá trị ngẫu nhiên mới cho từng ví để đa dạng hóa
    const localZigAmount = randomAmount();
    const localOroAmount = randomAmount();
    const localLiqOro = randomLiqValueAsString();
    // const localLiqZig = randomLiqValueAsString(); // Không cần vì được tính toán

    for (let i = 0; i < 50; i++) {
        await swap(mnemonic, localZigAmount, CONFIG.zigDenom, CONFIG.oroDenom);
        await delay(5000); // 5 giây
    }

    // for (let i = 0; i < 100; i++) {
    //     await swap(mnemonic, localOroAmount, CONFIG.oroDenom, CONFIG.zigDenom);
    //     await delay(5000); // 5 giây
    // }

    for (let i = 0; i < 200; i++) {
        console.log("\n💧 Đang thêm thanh khoản...");
        await addLiquidity(mnemonic, localLiqOro, "0"); // LIQ_ZIG được tính toán bên trong
        await delay(5000); // 5 giây
    }
    console.log(`\n🏁 Hoàn thành xử lý ví ${index + 1}: ${mnemonic.slice(0, 10)}...`);
}

async function runBot() {
    for (let cycleCount = 0; cycleCount < 1000000000; cycleCount++) {
        console.log(`\n=========== CHU KỲ ${cycleCount + 1} ===========`);
        console.log(`🕒 Bắt đầu xử lý toàn bộ ${MNEMONICS.length} ví...`);

        let processedCount = 0;
        let batch = [];

        // Duyệt từng ví theo thứ tự
        for (const [index, mnemonic] of MNEMONICS.entries()) {
            try {
                const balanceInfo = await getBalance(mnemonic, CONFIG.zigDenom);
                const isEligible = balanceInfo.formatted >= CONFIG.minZigBalance;

                console.log(`📱 Ví #${index + 1} (${mnemonic.slice(0, 10)}...) - ZIG: ${balanceInfo.formatted.toFixed(6)} | Đủ điều kiện: ${isEligible ? '✅' : '❌'}`);

                if (isEligible) {
                    batch.push({ mnemonic, index });
                }

                // Nếu đã đủ 20 ví trong batch → xử lý ngay
                if (batch.length >= CONFIG.targetBatchSize) {
                    console.log(`\n🚀 Đã tích lũy đủ ${CONFIG.targetBatchSize} ví → Bắt đầu xử lý batch...`);
                    await Promise.all(batch.map(walletData => processEligibleWallet(walletData)));
                    console.log(`✅ Hoàn thành batch gồm ${batch.length} ví.`);
                    batch = []; // Reset batch
                }

                processedCount++;

                // Delay nhỏ giữa các ví để tránh spam RPC
                if (index < MNEMONICS.length - 1) {
                    await delay(1000); // 1 giây giữa các ví
                }

            } catch (err) {
                console.error(`❌ Lỗi khi xử lý ví #${index + 1}:`, err.message);
                processedCount++;
            }
        }

        // Sau khi duyệt hết danh sách, nếu vẫn còn ví trong batch → xử lý nốt
        if (batch.length > 0) {
            console.log(`\n📌 Xử lý nốt ${batch.length} ví còn lại (không đủ 20 nhưng là cuối danh sách)...`);
            await Promise.all(batch.map(walletData => processEligibleWallet(walletData)));
            console.log(`✅ Hoàn thành xử lý nốt ${batch.length} ví cuối.`);
        }

        console.log(`\n🎉 CHU KỲ ${cycleCount + 1} HOÀN TẤT: Đã xử lý xong toàn bộ ${processedCount}/${MNEMONICS.length} ví.`);
        
        // Tùy chọn: chờ trước khi bắt đầu chu kỳ mới
        console.log(`⏳ Chờ 5 phút trước khi bắt đầu chu kỳ ${cycleCount + 2}...`);
        await delay(5 * 60 * 1000); // 5 phút
    }

    console.log("Bot đã hoàn thành tất cả các chu kỳ.");
}

// Start the bot
runBot().catch(err => {
    console.error("❌ Bot gặp lỗi nghiêm trọng:", err);
    process.exit(1);
});
