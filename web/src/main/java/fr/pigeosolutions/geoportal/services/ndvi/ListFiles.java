package fr.pigeosolutions.geoportal.services.ndvi;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;

import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.constants.Params;
import org.fao.geonet.lib.Lib;
import org.jdom.Element;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

//=============================================================================

/** Returns the list of NDVI-like files, in the specified folder, ordered alphabetically
 */

public class ListFiles implements Service
{
    private String _basepath;
    private String _ext;


    public void init(String appPath, ServiceConfig config) throws Exception {
        _basepath = config.getValue("basePath");
        _ext = config.getValue("ext");
    }

    //--------------------------------------------------------------------------
    //---
    //--- Service
    //---
    //--------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception
    {
       GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
        String geonetworkDataDir = gc.getHandlerConfig().getMandatoryValue( Geonet.Config.SYSTEM_DATA_DIR);
        
        String dataName = Util.getParam(params, "dataName","NDVI");
        
        String path = geonetworkDataDir+File.separator+_basepath+File.separator+dataName;
        String ext = _ext;
        if (path == null || ext==null)
        {
            System.out.println("Error recovering the params : "+path+"(path) / "+ext+"(ext)");
            return new Element(Jeeves.Elem.RESPONSE);
        }
        //else...
        Element filesList = new Element(Jeeves.Elem.RESPONSE);
        filesList.addContent(new Element("path").setText(path));
        filesList.addContent(new Element("ext").setText(ext));
        filesList.addContent(params);

        String files;
        try {
            File folder = new File(path);
            if (folder.canRead()) {
                File[] listOfFiles = folder.listFiles(); 
                Arrays.sort(listOfFiles);
                for (int i = 0; i < listOfFiles.length; i++) 
                {
                    if (listOfFiles[i].isFile()) 
                    {
                        files = listOfFiles[i].getName();
                        if (files.endsWith(ext))
                        {
                            //getValue(listOfFiles[i], lat, lon);
                            filesList.addContent(new Element("file").setText(files));
                        }
                    }
                }
            }
            
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        

        return filesList;
    }
}

//=============================================================================


