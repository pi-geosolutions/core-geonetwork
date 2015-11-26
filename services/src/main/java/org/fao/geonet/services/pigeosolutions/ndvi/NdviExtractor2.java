package org.fao.geonet.services.pigeosolutions.ndvi;

import org.geotools.coverage.grid.io.AbstractGridCoverage2DReader;

import java.io.File;
import java.util.Arrays;
/*import org.geotools.geometry.DirectPosition2D;
import org.geotools.referencing.CRS;
import org.opengis.geometry.DirectPosition;*/

public class NdviExtractor2 {

    private double lat = 14.50;
    private double lon = -5.0;
    private String path = "/home/jean/tmp/NDVI";
    private String ext = ".tif";
    
    private AbstractGridCoverage2DReader reader;
    
    
    /**
     * GeoTools NdviExtractor demo application. Prompts the user for a tiff file 
     * and outputs its value at a given location to the console
     */
    public static void main(String[] args) throws Exception {
        NdviExtractor2 me = new NdviExtractor2();
        me.getValues();
        //me.getLayersAndGo();
    }
    
    /**
     * Lists files in the directory, and gets the value out of each file
     * @throws Exception 
     */
    private void getValues() throws Exception {
        String files;
        File folder = new File(path);
        File[] listOfFiles = folder.listFiles(); 
        Arrays.sort(listOfFiles);
        for (int i = 0; i < listOfFiles.length; i++) 
        {
         if (listOfFiles[i].isFile()) 
         {
         files = listOfFiles[i].getName();
             if (files.endsWith(ext))
             {
                getValue(listOfFiles[i], lat, lon);
              }
           }
        }
    }

    
    private void getValue(File rasterFile, double lat, double lon) throws Exception {
/*        AbstractGridFormat format = GridFormatFinder.findFormat( rasterFile );        
        reader = format.getReader(rasterFile);
        GridCoverage2D cov = null;
        try {
            cov = reader.read(null);
        } catch (IOException giveUp) {
            throw new RuntimeException(giveUp);
        }
        DirectPosition pos = new DirectPosition2D(CRS.decode("EPSG:4326", true),lat, lon);
        double[] val = cov.evaluate(pos, (double[]) null);
        //System.out.println("Coverage CRS: \n"+cov.getCoordinateReferenceSystem());
        //System.out.println("Pos. CRS:\n"+pos.getCoordinateReferenceSystem());
        System.out.println("value:"+val[0]);*/
        
    }
    
}
