import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os

class QuoteAdderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Thêm Dấu Ngoặc Kép và Dấu Phẩy")
        self.root.geometry("600x400")
        self.root.resizable(False, False)
        
        # Variables
        self.input_file = tk.StringVar()
        self.output_file = tk.StringVar()
        
        self.create_widgets()
        
    def create_widgets(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Title
        title_label = ttk.Label(main_frame, text="Công Cụ Thêm Dấu Ngoặc Kép và Dấu Phẩy", 
                               font=("Arial", 14, "bold"))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Input file selection
        input_label = ttk.Label(main_frame, text="File đầu vào:")
        input_label.grid(row=1, column=0, sticky=tk.W, pady=5)
        
        input_entry = ttk.Entry(main_frame, textvariable=self.input_file, width=50)
        input_entry.grid(row=1, column=1, padx=(10, 10), pady=5)
        
        input_button = ttk.Button(main_frame, text="Chọn File", command=self.browse_input)
        input_button.grid(row=1, column=2, pady=5)
        
        # Output file selection
        output_label = ttk.Label(main_frame, text="File đầu ra:")
        output_label.grid(row=2, column=0, sticky=tk.W, pady=5)
        
        output_entry = ttk.Entry(main_frame, textvariable=self.output_file, width=50)
        output_entry.grid(row=2, column=1, padx=(10, 10), pady=5)
        
        output_button = ttk.Button(main_frame, text="Chọn Nơi Lưu", command=self.browse_output)
        output_button.grid(row=2, column=2, pady=5)
        
        # Process button
        process_button = ttk.Button(main_frame, text="XỬ LÝ", command=self.process_files)
        process_button.grid(row=3, column=0, columnspan=3, pady=30)
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=10)
        
        # Status label
        self.status_label = ttk.Label(main_frame, text="", foreground="blue")
        self.status_label.grid(row=5, column=0, columnspan=3, pady=10)
        
        # Preview frame
        preview_frame = ttk.LabelFrame(main_frame, text="Xem Trước", padding="10")
        preview_frame.grid(row=6, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=10)
        
        # Text widget for preview
        self.preview_text = tk.Text(preview_frame, height=8, width=60)
        scrollbar = ttk.Scrollbar(preview_frame, orient=tk.VERTICAL, command=self.preview_text.yview)
        self.preview_text.configure(yscrollcommand=scrollbar.set)
        
        self.preview_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
    def browse_input(self):
        filename = filedialog.askopenfilename(
            title="Chọn file đầu vào",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            self.input_file.set(filename)
            self.preview_input_content()
    
    def preview_input_content(self):
        try:
            with open(self.input_file.get(), 'r', encoding='utf-8') as file:
                content = file.read()
                self.preview_text.delete(1.0, tk.END)
                self.preview_text.insert(1.0, content[:500])  # Show first 500 characters
                if len(content) > 500:
                    self.preview_text.insert(tk.END, "\n... (nội dung tiếp theo bị cắt ngắn)")
        except Exception as e:
            messagebox.showerror("Lỗi", f"Không thể đọc file: {str(e)}")
    
    def browse_output(self):
        filename = filedialog.asksaveasfilename(
            title="Chọn nơi lưu file đầu ra",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            self.output_file.set(filename)
    
    def process_files(self):
        input_path = self.input_file.get()
        output_path = self.output_file.get()
        
        # Validation
        if not input_path:
            messagebox.showerror("Lỗi", "Vui lòng chọn file đầu vào!")
            return
        
        if not output_path:
            messagebox.showerror("Lỗi", "Vui lòng chọn nơi lưu file đầu ra!")
            return
        
        if not os.path.exists(input_path):
            messagebox.showerror("Lỗi", "File đầu vào không tồn tại!")
            return
        
        # Process files
        try:
            self.progress.start()
            self.status_label.config(text="Đang xử lý...")
            self.root.update()
            
            # Process the file
            self.add_quotes_and_comma_to_lines(input_path, output_path)
            
            self.progress.stop()
            self.status_label.config(text="Hoàn thành!")
            messagebox.showinfo("Thành công", f"Đã xử lý xong!\nFile đầu ra: {output_path}")
            
        except Exception as e:
            self.progress.stop()
            self.status_label.config(text="Lỗi!")
            messagebox.showerror("Lỗi", f"Đã xảy ra lỗi: {str(e)}")
    
    def add_quotes_and_comma_to_lines(self, input_file, output_file):
        with open(input_file, 'r', encoding='utf-8') as infile, \
             open(output_file, 'w', encoding='utf-8') as outfile:
            
            for line in infile:
                line = line.rstrip('\n\r')  # Remove line breaks but preserve other whitespace
                outfile.write(f'"{line}",\n')

def main():
    root = tk.Tk()
    app = QuoteAdderApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()