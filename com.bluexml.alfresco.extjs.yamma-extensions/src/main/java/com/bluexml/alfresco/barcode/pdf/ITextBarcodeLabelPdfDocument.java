package com.bluexml.alfresco.barcode.pdf;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.LabelPageIterator;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.MarginConfiguration;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Utilities;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;

public class ITextBarcodeLabelPdfDocument extends AbstractBarcodeLabelPdfDocument {
	
	private boolean showLabelBorders = false;
	
	@Override
	protected com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateOperation getOperation() {
		return new GenerateOperation();
	}	
	
	private final class GenerateOperation implements com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateOperation {
		
		private int labelNumber = -1;
		private Document doc = null;
		private PdfWriter writer = null;
		private PdfContentByte over = null;
		
		private final MarginConfiguration labelPadding = pageConfiguration.getLabelPadding();
		private final Rectangle labelSize = pageConfiguration.getLabelSize();
				
		public synchronized void execute(OutputStream output, int labelNumber) throws Exception {

			this.labelNumber = labelNumber;
			
	        try {
	        	
	        	createPdfDocument(output);
	        	
	        	while (this.labelNumber > 0) {
	        		createNewPage();
	        		drawPageLabels();
	        	}
	            
	            doc.close();
	            
	        }
	        
	        finally {
	        	if( writer != null ) writer.close();
	        }
			
		}
		
		private void createPdfDocument(OutputStream output) throws IOException, DocumentException {
			final Rectangle pageSize = pageConfiguration.getPageSize();
			
			doc = new Document(
					new com.lowagie.text.Rectangle(
							Utilities.millimetersToPoints(pageSize.width), 
							Utilities.millimetersToPoints(pageSize.height)
					)
			);
			writer = PdfWriter.getInstance(doc, output);
			doc.open();
		}
		
		private void createNewPage() throws IOException {
			doc.newPage();
			over = writer.getDirectContent();
		}
				
		private void drawPageLabels() throws IOException, DocumentException {
			
			final LabelPageIterator iterator = pageConfiguration.getLabelIterator();
			
			while (iterator.hasNext()) {
				
				if (labelNumber-- <= 0) break; // break early
				
				final Position position = iterator.next();
				if (showLabelBorders) showLabelBorder(position);
				
	            final float bottomLeftX = Utilities.millimetersToPoints(position.x + labelPadding.getLeft());
	            final float bottomLeftY = Utilities.millimetersToPoints(position.y + labelPadding.getDown());
	            
	            final BufferedImage bufferedImage = getNextBarcode(null);
	            final com.lowagie.text.Image image = com.lowagie.text.Image.getInstance(bufferedImage, null);
	            
	            final float availableWidth = Utilities.millimetersToPoints(labelSize.width - labelPadding.getLeft() - labelPadding.getRight());
	            final float availableHeight = Utilities.millimetersToPoints(labelSize.height - labelPadding.getUp() - labelPadding.getDown());
	            image.scaleToFit(availableWidth, availableHeight);
	            
	            final float scaledWidth = image.getScaledWidth();
	            final float deltaX = (availableWidth - scaledWidth) / 2;
	            final float scaledHeight = image.getScaledHeight();
	            final float deltaY = (availableHeight - scaledHeight) / 2;
	            
	            image.setAbsolutePosition(bottomLeftX + deltaX, bottomLeftY + deltaY);
	            
	            doc.add(image);
			}
            
            
		}
		
		private void showLabelBorder(Position position) {
			over.saveState();
			
			over.setLineWidth(1.5f);
			over.setColorStroke(new Color(200,200,200));
			
			over.rectangle(
					Utilities.millimetersToPoints(position.x), 
					Utilities.millimetersToPoints(position.y), 
					Utilities.millimetersToPoints(labelSize.width), 
					Utilities.millimetersToPoints(labelSize.height)
			);
			
			over.stroke();
			over.restoreState();
		}
		
		private BufferedImage getNextBarcode(Object config) throws IOException {
			
			final String newReference = referenceProvider.getUnboundReference(config);
			return barcodeGenerator.generate(newReference);
			
		}
		
	}
	

	/*
	 * Spring IoC/DI material
	 */
	
	public void setShowLabelBorders(boolean showLabelBorders) {
		this.showLabelBorders = showLabelBorders;
	}
}
