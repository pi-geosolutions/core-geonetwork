package org.fao.geonet.repository.pigeosolutions;

import org.fao.geonet.domain.pigeosolutions.FeatureInfoLabel;
import org.fao.geonet.domain.pigeosolutions.LayerTreeNode;
import org.fao.geonet.repository.GeonetRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

/**
 * Created by fgravin on 21/11/2015.
 */
public interface FeatureInfoLabelRepository extends GeonetRepository<FeatureInfoLabel, Integer>,
        JpaSpecificationExecutor<FeatureInfoLabel> {

    List<FeatureInfoLabel> findOneByLayername(String layername);

}