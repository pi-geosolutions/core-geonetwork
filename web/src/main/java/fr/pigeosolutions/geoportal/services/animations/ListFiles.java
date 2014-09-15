package fr.pigeosolutions.geoportal.services.animations;

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
        if (_basepath.startsWith("/")) { //then it is an absolute URL
            path = _basepath+File.separator+dataName;
        } 
        String ext = _ext;
        if (path == null || ext==null)
        {
            System.out.println("Error recovering the params : "+path+"(path) / "+ext+"(ext)");
            return new Element(Jeeves.Elem.RESPONSE);
        }
        //else...
        Element response = new Element(Jeeves.Elem.RESPONSE);


        Element list = new Element("list");
        list.addContent(new Element("path").setText(path));
        list.addContent(new Element("extension").setText(ext));
        list.addContent(new Element("dataname").setText(dataName));
        String file;
        try {
            File folder = new File(path);
            if (folder.canRead()) {
                File[] listOfFiles = folder.listFiles(); 
                Arrays.sort(listOfFiles);
                for (int i = 0; i < listOfFiles.length; i++) 
                {
                    if (listOfFiles[i].isFile()) 
                    {
                        file = listOfFiles[i].getName();
                        if (file.endsWith(ext))
                        {
                            //getValue(listOfFiles[i], lat, lon);
                            list.addContent(new Element("record").addContent(new Element("name").setText(file))); 
                        }
                    }
                }
            }
            
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }

        response.addContent(list);

        return response;
    }
}

//=============================================================================


