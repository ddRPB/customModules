/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.labkey.hdrl;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.hdrl.query.HDRLQuerySchema;
import org.labkey.hdrl.view.InboundRequestBean;
import org.labkey.hdrl.view.InboundSpecimenBean;

import java.util.List;
import java.util.Map;

public class HDRLManager
{
    private static final Logger LOG = Logger.getLogger(HDRLManager.class);
    private static final String HDRL_SENSITIVE_DATA_TIME_WINDOW = "hdrlSensitiveDataDeletionTimeWindow";
    private static final String NUM_OF_DAYS_KEY = "HDRLSensitiveDataDeletionWindow";
    private static final int DEFAULT_NUM_OF_DAYS = 30; //default number of days after which data will be deleted

    private static final HDRLManager _instance = new HDRLManager();

    private HDRLManager()
    {
        // prevent external construction with a private default constructor
    }

    public static HDRLManager get()
    {
        return _instance;
    }

    public InboundRequestBean getInboundRequest(User user, Container container, Integer requestId)
    {
        UserSchema schema = QueryService.get().getUserSchema(user, container, HDRLQuerySchema.NAME);
        SQLFragment sql = new SQLFragment("SELECT r.RequestId, r.ShippingNumber, s.Name as RequestStatus, c.Name as ShippingCarrier, t.Name as TestType FROM ");
        sql.append("(SELECT * FROM hdrl.InboundRequest WHERE (Container = ?) AND (RequestId = ?)) r ");
        sql.add(container);
        sql.add(requestId);
        sql.append("LEFT JOIN hdrl.ShippingCarrier c on r.ShippingCarrierId = c.RowId ")
                .append("LEFT JOIN hdrl.TestType t on r.TestTypeId = t.RowId ")
                .append("LEFT JOIN hdrl.RequestStatus s on r.RequestStatusId = s.RowId ");


        SqlSelector sqlSelector = new SqlSelector(schema.getDbSchema(), sql);
        return sqlSelector.getObject(InboundRequestBean.class);
    }

    public List<InboundSpecimenBean> getInboundSpecimen(int requestId)
    {
        String joinStatement = "SELECT hdrl.inboundspecimen.*, hdrl.gender.code as genderId, hdrl.familymemberprefix.code as fmpCode, hdrl.dutycode.code as ducCode, hdrl.sourceoftesting.code as sotCode" +
                " FROM hdrl.inboundspecimen" +
                " LEFT JOIN hdrl.gender" +
                " ON hdrl.inboundspecimen.genderId=hdrl.gender.rowid" +
                " LEFT JOIN hdrl.familymemberprefix" +
                " ON hdrl.inboundspecimen.fmpid=hdrl.familymemberprefix.rowid" +
                " LEFT JOIN hdrl.dutycode" +
                " ON hdrl.inboundspecimen.dutycodeid=hdrl.dutycode.rowid" +
                " LEFT JOIN hdrl.sourceoftesting" +
                " ON hdrl.inboundspecimen.testingsourceid=hdrl.sourceoftesting.rowid" +
                " WHERE hdrl.inboundspecimen.inboundrequestid = ?";

        SQLFragment sql = new SQLFragment();
        sql.append(joinStatement);
        sql.add(requestId);

        SqlSelector selector = new SqlSelector(HDRLSchema.getInstance().getTableInfoInboundSpecimen().getSchema(), sql);
        return selector.getArrayList(InboundSpecimenBean.class);
    }

    public static void saveProperties(HDRLController.SensitiveDataForm sensitiveDataForm)
    {
        PropertyManager.PropertyMap map = PropertyManager.getNormalStore().getWritableProperties(HDRL_SENSITIVE_DATA_TIME_WINDOW, true);
        map.clear();
        map.put(NUM_OF_DAYS_KEY, String.valueOf(sensitiveDataForm.getTimeWindowInDays()));
        map.save();
    }

    private static Map<String, String> getProperties()
    {
        return PropertyManager.getNormalStore().getProperties(HDRL_SENSITIVE_DATA_TIME_WINDOW);
    }

    public static int getNumberOfDays()
    {
        String days = getProperties().get(NUM_OF_DAYS_KEY);

        if (StringUtils.isEmpty(days))
        {
            return DEFAULT_NUM_OF_DAYS;
        }

        return Integer.parseInt(days);
    }

}