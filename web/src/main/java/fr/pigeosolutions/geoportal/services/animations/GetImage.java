package fr.pigeosolutions.geoportal.services.animations;

import jeeves.constants.Jeeves;
import jeeves.exceptions.ResourceNotFoundEx;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.BinaryFile;
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

public class GetImage implements Service
{
    public void init(String appPath, ServiceConfig config) throws Exception {}

    //--------------------------------------------------------------------------
    //---
    //--- Service
    //---
    //--------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception
    {
        String path  = Util.getParam(params, "path");
        String fname  = Util.getParam(params, "name");
     // Build the response
        File dir = new File(path);
        File file= new File(dir, fname);

        context.info("File is : " +file);
        if (!file.exists())
            throw new ResourceNotFoundEx(fname);

        return BinaryFile.encode(200, file.getAbsolutePath());
    }
}

//=============================================================================


