package org.fao.geonet.pigeosolutions.geoportal.services.adminunit;

import org.apache.commons.dbcp.BasicDataSource;
import org.fao.geonet.ApplicationContextHolder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Created by fgravin on 21/11/2015.
 */

@Controller
public class GetAU {

    @Autowired
    JdbcTemplate jdbcTemplate;

    private BasicDataSource dataSource;
    @Resource(name="ne_risques_geodata")
    public void setBean( BasicDataSource bean ) {
        dataSource = bean;
    }

    @RequestMapping(value="/{lang}/pigeo.adminunit/{type}/", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONObject get(@PathVariable String lang, @PathVariable String type) throws SQLException, JSONException {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        String sql = "select gid, nom_" + type + ", ST_AsText (ST_Envelope(the_geom)) from ner_1b2_" + type + "s";

        jdbcTemplate = new JdbcTemplate(dataSource);
        Connection con = dataSource.getConnection();

        JSONObject res = new JSONObject();
        res.put("data", new JSONArray(jdbcTemplate.query(sql, new DataRowMapper())));

        Statement stmt = null;
        ResultSet rs = null;
        return res;

/*
        try {
            stmt = con.createStatement();
            rs = stmt.executeQuery(sql);
            ResultSetMetaData rsmd = rs.getMetaData();

            while (rs.next()) {
                JSONObject o = new JSONObject();
                for (int i = 1; i <= rsmd.getColumnCount(); i++) {
                    o.put(rsmd.getColumnName(i), rs.getString(i));
                }
                ret.add(o);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
        }
*/


    }

}
