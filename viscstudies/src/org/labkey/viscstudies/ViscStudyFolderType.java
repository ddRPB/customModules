/*
 * Copyright (c) 2011-2012 LabKey Corporation
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
package org.labkey.viscstudies;

import org.labkey.api.data.Container;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.module.Module;
import org.labkey.api.module.MultiPortalFolderType;
import org.labkey.api.portal.ProjectUrls;
import org.labkey.api.security.User;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.study.StudyUrls;
import org.labkey.api.study.TimepointType;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.FolderTab;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;
import org.labkey.api.view.ViewContext;

import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: markigra
 * Date: 11/7/11
 * Time: 3:17 PM
 */
public class ViscStudyFolderType extends MultiPortalFolderType
{
    private static final List<FolderTab> PAGES = Arrays.asList(
            new ViscStudyFolderTabs.OverviewPage("Overview"),
            new ViscStudyFolderTabs.VaccineDesignPage("Vaccine Design"),
            new ViscStudyFolderTabs.ImmunizationsPage("Immunizations"),
            new ViscStudyFolderTabs.AssaysPage("Assays"),
            new ViscStudyFolderTabs.DataAnalysisPage("Data"),
            new ViscStudyFolderTabs.ManagePage("Manage")
    );


    public ViscStudyFolderType(Module module)
    {
        super("CAVD Study", "A folder type to store vaccine studies performed for the Gates Foundation-funded CAVD",
                null,
                Arrays.asList(Portal.getPortalPart("Study Protocol Summary").createWebPart()),
                getDefaultModuleSet(module, getModule("Experiment"), getModule("Study"), getModule("Pipeline")),
                getModule("Study"));
    }

    @Override
    public ActionURL getStartURL(Container c, User user)
    {
        return PageFlowUtil.urlProvider(ProjectUrls.class).getBeginURL(c);
    }

    protected String getFolderTitle(ViewContext ctx)
    {
        Study study = StudyService.get().getStudy(ctx.getContainer());
        return study != null ? study.getLabel() : ctx.getContainer().getName();
    }

    @Override
    public List<FolderTab> getDefaultTabs()
    {
        return PAGES;
    }

    @Override
    public void configureContainer(Container c, User user)
    {
        super.configureContainer(c, user);
        //Create Study here
        try
        {
            if (null == StudyService.get().getStudy(c))
                StudyService.get().createStudy(c, user, c.getName() + " Study", TimepointType.DATE);

        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void addManageLinks(NavTree adminNavTree, Container container)
    {
        super.addManageLinks(adminNavTree, container);
        adminNavTree.addChild(new NavTree("Manage Views", PageFlowUtil.urlProvider(StudyUrls.class).getManageReports(container)));
    }
}