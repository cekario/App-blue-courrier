package com.bluexml.alfresco.pdf;

import java.io.OutputStream;

public interface MergeOperation {
	
	void merge(final OutputStream destinationStream) throws PdfOperationException;
	
}
