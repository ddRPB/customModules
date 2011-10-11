SELECT
A._sample.property.NETWORK as NETWORK,
--A.NETWORK,
A.PROTOCOL,
A.LABID,
A.ASSAYID,
A.SPECROLE,
A.PTID,
A._sample.property.PTIDTYPE as PTIDTYPE,
--A.PTIDTYPE,
A.CTRSAMPNAME,
A.STDY_DESC,
A.VISITNO,
A.DRAWDT,
A.TESTDT,
A.PLATE,
A.SAMP_ORD,
A.WELL_ID,
A.WELLROLE,
A.ANTIGEN,
A.NREPL,
A.ANALYSIS_PLAN_ID,
A.EXP_ASSAY_ID,
A.COLLECTCT,
A.SUBSET1, A.SUBSET1_NUM,
A.SUBSET2, A.SUBSET2_NUM,
A.SUBSET3, A.SUBSET3_NUM,
A.SUBSET4, A.SUBSET4_NUM,
A.SUBSET5, A.SUBSET5_NUM,
A.SUBSET6, A.SUBSET6_NUM,
A.SUBSET7, A.SUBSET7_NUM,
A.SUBSET8, A.SUBSET8_NUM,
A.SUBSET9, A.SUBSET9_NUM,
A.SUBSET10, A.SUBSET10_NUM,
NULL AS NUMVIALS,
NULL AS VIAL1_ID,
NULL AS VIAL2_ID,
NULL AS VIAL3_ID,
NULL AS VIAL4_ID,
--A._fcsfile.Sample.Property.NUMVIALS,
--A._fcsfile.Sample.Property.VIAL1_ID,
--A._fcsfile.Sample.Property.VIAL2_ID,
--A._fcsfile.Sample.Property.VIAL3_ID,
--A._fcsfile.Sample.Property.VIAL4_ID,
A.PREFRZCT,
A.VIABL1,
A.RECOVR1,
A.VIABL2,
A.RECOVR2,
A.METHOD,
A.REPLACE,
A.MODDT,
A.Comments,
A._well, A._fcsfile, A._sample

FROM AnalysisPlanTemplate A
WHERE A.ANALYSIS_PLAN_ID = '9'