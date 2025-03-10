# Tax Planning Assistant

A sophisticated web application that helps users analyze and process various tax documents, including W-2s, 1098s, K-1s, and 1099s, to provide comprehensive tax calculations and insights.

## Features

- **Document Processing**:
  - W-2 forms (including special handling for ByteDance and other employers)
  - 1098 Mortgage Interest statements
  - K-1 Partnership documents
  - 1099 forms (INT, DIV, MISC, NEC)
  - Stock transaction details
  - Capital gains/losses tracking

- **Advanced Text Extraction**:
  - Multi-layered OCR processing with EasyOCR and Tesseract
  - PDF text extraction with PyMuPDF and PyPDF2
  - Fallback mechanisms for optimal text extraction

- **Tax Calculations**:
  - 2024 tax brackets support
  - Multiple filing status options
  - Standard deduction optimization
  - Itemized deductions processing
  - Automatic tax liability calculation
  - Refund/amount due estimation

- **Modern UI/UX**:
  - Material Design components
  - Drag-and-drop file upload
  - Real-time processing feedback
  - Interactive notifications
  - Responsive design
  - Clean and professional interface

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ratnaditya-J/TaxPlanning.git
   cd TaxPlanning
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install Tesseract OCR:
   - Mac: `brew install tesseract`
   - Linux: `sudo apt-get install tesseract-ocr`
   - Windows: Download installer from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

## Usage

1. Start the server:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to `http://localhost:5566`

3. Upload your tax documents using the drag-and-drop interface or file selector

4. Select your filing status and submit for processing

5. Review the calculated results and tax insights

## Dependencies

- Flask: Web framework
- PyMuPDF: Enhanced PDF processing
- EasyOCR: Primary OCR engine
- Tesseract: Backup OCR engine
- PyPDF2: PDF text extraction
- PIL: Image processing
- Material Design Components: UI framework

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material Design for the UI components
- EasyOCR and Tesseract teams for OCR capabilities
- PyMuPDF for advanced PDF processing
