/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.icemr.assay.actions;

import org.labkey.api.assay.dilution.DilutionAssayProvider;
import org.labkey.api.assay.dilution.DilutionRunUploadForm;
import org.labkey.api.exp.ExperimentException;
import org.labkey.api.exp.api.ExpRun;
import org.labkey.api.security.RequiresPermissionClass;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.study.actions.PlateBasedUploadWizardAction;
import org.labkey.api.study.actions.PlateUploadForm;
import org.labkey.api.study.actions.UploadWizardAction;
import org.labkey.api.view.ActionURL;
import org.labkey.icemr.assay.DrugSensitivityAssayProvider;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletException;

/**
 * Created by IntelliJ IDEA.
 * User: klum
 * Date: 5/14/13
 */
@RequiresPermissionClass(InsertPermission.class)
public class DrugSensitivityUploadWizardAction extends PlateBasedUploadWizardAction<DrugSensitivityRunUploadForm, DrugSensitivityAssayProvider>
{
    public DrugSensitivityUploadWizardAction()
    {
        setCommandClass(DrugSensitivityRunUploadForm.class);
    }

    protected ModelAndView afterRunCreation(DrugSensitivityRunUploadForm form, ExpRun run, BindException errors) throws ServletException, ExperimentException
    {
        if (form.getReRun() != null)
            form.getReRun().delete(getViewContext().getUser());
        return super.afterRunCreation(form, run, errors);
    }

    @Override
    protected ActionURL getUploadWizardCompleteURL(DrugSensitivityRunUploadForm form, ExpRun run)
    {
        DilutionAssayProvider provider = form.getProvider();
        return provider.getUploadWizardCompleteURL(form, run);
    }
}