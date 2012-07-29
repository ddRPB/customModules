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
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.view.WebPartFactory;

import java.util.Collection;
import java.util.Collections;

public class ViscStudiesModule extends DefaultModule
{
    public String getName()
    {
        return "ViscStudies";
    }

    public double getVersion()
    {
        return 12.20;
    }

    public boolean hasScripts()
    {
        return false;
    }

    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    protected void init()
    {
        addController("viscstudies", ViscStudiesController.class);

        DefaultSchema.registerProvider(ViscStudySchema.NAME, new DefaultSchema.SchemaProvider()
        {
            public QuerySchema getSchema(DefaultSchema schema)
            {
                return new ViscStudySchema(schema.getUser(), schema.getContainer());
            }
        });
    }

    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new ViscStudiesContainerListener());
        ModuleLoader.getInstance().registerFolderType(this, new ViscStudyFolderType(this));
    }

    @Override
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

}