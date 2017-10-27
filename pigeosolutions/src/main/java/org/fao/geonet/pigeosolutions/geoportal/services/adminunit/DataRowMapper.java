package org.fao.geonet.pigeosolutions.geoportal.services.adminunit;

import net.sf.json.JSONObject;
import org.postgis.PGgeometry;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.JdbcUtils;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

public class DataRowMapper implements RowMapper
{

    public Object mapRow(ResultSet rs, int rowNum) throws SQLException {

        ResultSetMetaData rsmd = rs.getMetaData();
        int columnCount = rsmd.getColumnCount();
        JSONObject obj = new JSONObject();

        for (int index = 1; index <= columnCount; index++) {
            String column = JdbcUtils.lookupColumnName(rsmd, index);
            Object value = rs.getObject(column);

            try {
                if(value instanceof String) {
                    String svalue = ((String)value).trim();
                    obj.put(column, svalue);
                }
                else if(value instanceof PGgeometry) {
                    continue;
                }
                else {
                    obj.put(column, value);
                }
            } catch (Exception e) {
                e.printStackTrace();
                throw new IllegalArgumentException("Cannot map to JSON => " + column + " : " + value);
            }
        }
        return obj;
    }

}
