interface PDFTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

// interface PDFTextContent {
//   items: PDFTextItem[];
// }

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export class ClientPdfParser {
  static async parsePDF(file: File): Promise<string> {
    try {
      // Load PDF.js dynamically
      await this.loadPDFJS();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let pageText = '';
        let lastY: number | null = null;

        textContent.items.forEach((item: PDFTextItem) => {
          const currentY = item.transform[5];

          // Add line break if Y position changes significantly (new line)
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            pageText += '\n';
          }

          // Add space between items on the same line
          if (lastY !== null && Math.abs(currentY - lastY) <= 5) {
            pageText += ' ';
          }

          pageText += item.str;
          lastY = currentY;
        });

        fullText += pageText + '\n\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  private static async loadPDFJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      // Load PDF.js from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        // Set worker source
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  }
}