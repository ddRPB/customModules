/*
 * Copyright (c) 2012-2019 LabKey Corporation
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
SELECT  P.RowId
, CASE WHEN P.Charge=1 THEN P.Hyper ELSE 999999 END AS HyperChgFilt1
, CASE WHEN P.Charge=2 THEN P.Hyper ELSE 999999 END AS HyperChgFilt2
, CASE WHEN P.Charge=3 THEN P.Hyper ELSE 999999 END AS HyperChgFilt3
, CASE WHEN P.Charge=4 THEN P.Hyper ELSE 999999 END AS HyperChgFilt4	
FROM XTandemPeptides P 
