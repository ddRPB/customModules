Ext4.define('AtlasTools.NAb.RecoverFiles', {
    extend: 'Ext.panel.Panel',
    border: false,
    rows: null,

    initComponent : function()
    {
        this.items = [
            this.getRunToolButton(),
            this.getSearchProgressBar(),
            this.getMessagePanel(),
            this.getFilesFoundHeaderView(),
            this.getFilesFoundBodyView(),
            this.getFilesNotFoundHeaderView(),
            this.getFilesNotFoundBodyView(),
            this.getFixPathsButton()
        ];

        this.callParent();

        this.on('render', function()
        {
            //this.getRunToolButton().setName()
        }, this);
    },

    getFilesFoundHeaderView: function()
    {
        if (!this.filesFoundHeaderView)
        {
            this.filesFoundHeaderView = this.makeRunDataFileHeaderView("Files Found");
        }
        return this.filesFoundHeaderView;
    },

    getFilesFoundBodyView: function()
    {
        if (!this.filesFoundBodyView)
        {
            this.filesFoundBodyView = this.makeRunDataFileBodyView(this.getRunDataFilesFoundStore());
        }
        return this.filesFoundBodyView;
    },

    getFilesNotFoundHeaderView: function()
    {
        if (!this.filesNotFoundHeaderView)
        {
            this.filesNotFoundHeaderView = this.makeRunDataFileHeaderView("Files Not Found");
        }
        return this.filesNotFoundHeaderView;
    },

    getFilesNotFoundBodyView: function()
    {
        if (!this.filesNotFoundBodyView)
        {
            this.filesNotFoundBodyView = this.makeRunDataFileBodyView(this.getRunDataFilesNotFoundStore());
        }
        return this.filesNotFoundBodyView;
    },

    getRunDataFilesFoundStore: function()
    {
        if (!this.runDataFilesFoundStore)
        {
            this.runDataFilesFoundStore = this.makeRunDataFileStore();
        }

        return this.runDataFilesFoundStore;
    },

    getRunDataFilesNotFoundStore: function()
    {
        if (!this.runDataFilesNotFoundStore)
        {
            this.runDataFilesNotFoundStore = this.makeRunDataFileStore();
        }

        return this.runDataFilesNotFoundStore;
    },

    makeRunDataFileStore : function()
    {
        return Ext4.create('Ext.data.Store', {
            fields: [
                {name: 'RowId'},
                {name: 'Name'},
                {name: 'DataFileUrl'},
                {name: 'Run/Protocol/Name'},
                {name: 'FileExists'},
                {name: 'FileExistsAtCurrent', defaultValue: null},
                {name: 'FilePathFixed', defaultValue: null},
                {name: 'NewDataFileUrl', defaultValue: null},
                {name: 'StatusMessage', defaultValue: null}
            ],
            data: []
        });
    },

    getRunToolButton : function()
    {
        if (!this.runToolBtn)
        {
            var getParams = document.URL.split("?");
            var params = Ext4.urlDecode(getParams[1]);

            if((params == null) || (params['runSearch'] !== 'true') )
            {
                this.runToolBtn = Ext4.create('Ext.button.Button', {
                    text: 'Go To Search Page',
                    style: 'margin-bottom: 10px;',
                    scope: this,
                    handler: this.queryForOrphanedRunFiles
                });
            }
            else  // must be actual search
            {
                this.runToolBtn = Ext4.create('Ext.button.Button', {
                    text: 'Run Search',
                    style: 'margin-bottom: 10px;',
                    scope: this,
                    handler: this.queryForOrphanedRunFiles
                });
            }
        }

        return this.runToolBtn;
    },

    getFixPathsButton : function()
    {
        if (!this.fixPathsBtn)
        {
            this.fixPathsBtn = Ext4.create('Ext.button.Button', {
                text: 'Fix Paths',
                style: 'margin-top: 20px;',
                hidden: true,
                scope: this,
                handler: this.attemptFixDataFilePaths
            });
        }

        return this.fixPathsBtn;
    },

    getSearchProgressBar : function()
    {
        if (!this.searchProgressBar)
        {
            this.searchProgressBar = Ext4.create('Ext.ProgressBar', {
                hidden: true,
                style: 'margin: 10px 0;',
                width: 500
            });
        }

        return this.searchProgressBar;
    },

    getMessagePanel : function()
    {
        if (!this.messagePanel)
        {
            this.messagePanel = Ext4.create('Ext.Component', {
                hidden: true
            });
        }

        return this.messagePanel;
    },

    // Header and body are split so that one can use a data: section and the other can use a store
    // This is because mixing them in a single view is bad and leads to a trip to Unexpected Behavior Land

    makeRunDataFileHeaderView : function(heading)
    {
        return Ext4.create('Ext.view.View', {
            data: {
                heading: heading,
                sectionTotalUpdated: null,
                sectionTotalSkipped: null,
                hasRun: null  // show heading
            },
            tpl: new Ext4.XTemplate(
                '<div class="section" id="nab-section-heading">',
                    '<tpl if="hasRun != null">',
                        '<span class="section-heading">{heading}</span>',
                    '</tpl>',
                    '<tpl if="sectionTotalUpdated != null">',
                        '<div class="section-total"><span class="section-total-label">Files Updated:</span> <span>{sectionTotalUpdated}</span></div>',
                    '</tpl>',
                    '<tpl if="sectionTotalSkipped != null">',
                        '<div class="section-total"><span class="section-total-label">Files Skipped:</span> <span>{sectionTotalSkipped}</span></div>',
                    '</tpl>',
                '</div>'
            ),
            getHeading: function()
            {
                return heading;
            }
        });
    },

    makeRunDataFileBodyView : function(store)
    {
        return Ext4.create('Ext.view.View', {
            store: store,
            tpl: new Ext4.XTemplate(
                '<div class="section-body" id="nab-section-body">',
                    '<tpl for=".">',
                        '<tpl if="FileExists === false">',
                            '<tpl if="NewDataFileUrl != null">',  // already processed
                                '<div class="field-header"><input type="checkbox" data-rowid="{RowId}" class="file-check" checked disabled> <span>{Name}</span></div>',
                            '<tpl elseif="FileExistsAtCurrent === true">',  // not yet processed, but could be
                                '<div class="field-header"><input type="checkbox" data-rowid="{RowId}" class="file-check" checked> <span>{Name}</span></div>',
                            '<tpl else>',  // cannot be processed
                                '<div class="field-header"><input type="checkbox" data-rowid="{RowId}" class="file-check" disabled> <span>{Name}</span></div>',
                            '</tpl>',
                            '<div class="field-content"><span class="field-label">Previous Data File URL:</span> <span>{DataFileUrl}</span></div>',
                            '<tpl if="NewDataFileUrl != null">',
                                '<div class="field-content fixed"><span class="field-label">New Data File URL:</span> <span>{NewDataFileUrl} {sectionTotalUpdated}</span></div>',
                            '</tpl>',
                            '<tpl if="StatusMessage != null">',
                                '<div class="field-content not-fixed"><span>{StatusMessage}</span></div>',
                            '</tpl>',
                        '</tpl>',
                    '</tpl>',
                '</div>'
            )
        });
    },

    queryForOrphanedRunFiles : function()
    {
        // since the search results can display as a long vertical page of details, go to the action in its own page
        this.resetData();

        if (LABKEY.ActionURL.getAction() != 'recoverNAbFiles')
        {
            window.location = LABKEY.ActionURL.buildURL('atlastools', 'recoverNAbFiles', null, {runSearch: true});
            return;
        }

        this.getRunToolButton().disable();

        this.getSearchProgressBar().updateText('Loading run data file count...');
        this.getSearchProgressBar().show();

        LABKEY.Query.selectRows({
            schemaName: 'exp',
            queryName: 'Data',
            filterArray: [LABKEY.Filter.create('Run', null, LABKEY.Filter.Types.NONBLANK)],
            columns: 'RowId, Name, DataFileUrl, FileExists, Run/Protocol/Name',
            containerFilter: LABKEY.Query.containerFilter.currentAndSubfolders,
            scope: this,
            success: function(data)
            {
                this.getMessagePanel().show();

                if (data.rows.length > 0)
                {
                    this.rows = data.rows;
                    // call the checkDataFile API for each row
                    this.checksCompleted = 0;
                    this.updateRunDataFileCountProgress(this.checksCompleted, this.rows.length, true);
                    Ext4.each(this.rows, function(row)
                    {
                        this.checkIndividualRunDataFile(row);
                    }, this);
                }
                else
                {
                    this.getMessagePanel().update('No run data files found in this folder.');
                    this.getSearchProgressBar().hide();
                    this.getRunToolButton().enable();
                }
            }
        });
    },

    resetData : function()
    {
        this.getFilesFoundHeaderView().update({
            heading: this.getFilesFoundHeaderView().getHeading(),  // otherwise it will be erased
            sectionTotalUpdated: null,
            sectionTotalSkipped: null
        });
        this.getFilesFoundBodyView().getStore().removeAll();
        this.getFilesNotFoundBodyView().getStore().removeAll();
    },

    checkIndividualRunDataFile : function(row)
    {
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('experiment', 'checkDataFile.api'),
            method: 'POST',
            params: {
                rowId: row['RowId']
            },
            scope: this,
            success: function(response){
                var json = Ext4.decode(response.responseText);
                row['FileExists'] = json.fileExists;
                row['FileExistsAtCurrent'] = json.fileExistsAtCurrent;

                this.checksCompleted++;
                this.updateRunDataFileCountProgress(this.checksCompleted, this.rows.length, true);
            }
        });
    },

    updateRunDataFileCountProgress : function(num, denom, asCheck)
    {
        var percentage = num / denom,
                verb = asCheck ? 'Checking' : 'Fixing';
        this.getSearchProgressBar().updateProgress(percentage, verb + ' run data files: ' + num + ' of ' + denom);

        this.getRunToolButton().enable();
        this.getSearchProgressBar().show();
        if (num == denom)
        {
            this.getSearchProgressBar().hide();

            if(this.getRunDataFilesFoundStore().count() === 0)  // not filled yet, so we can do processing
            {
                this.sortDatabaseRows();
                var i = 0;
                while ((this.rows[i]['FileExistsAtCurrent'] !== false) && (i < this.rows.length))  // find dividing point between found/not found
                {
                    i++;
                }
                this.getRunDataFilesFoundStore().loadData(this.rows.slice(0, i));
                this.getRunDataFilesNotFoundStore().loadData(this.rows.slice(i, this.rows.length));

                this.getFilesFoundHeaderView().update({
                    heading: this.getFilesFoundHeaderView().getHeading(),  // otherwise it will be erased
                    hasRun: true  // show heading
                });

                this.getFilesNotFoundHeaderView().update({
                    heading: this.getFilesNotFoundHeaderView().getHeading(),  // otherwise it will be erased
                    hasRun: true  // show heading
                });
            }

            if (asCheck)
            {
                var rowsToBeFixed = this.rows.filter(function(row)
                {
                    return row["FileExists"] === false;
                });
                if (rowsToBeFixed.length == 0)
                    this.getMessagePanel().update('No run data files to be fixed in this folder.');
                else
                    this.getFixPathsButton().show();
            }
        }
    },

    sortDatabaseRows : function()
    {
        function rowsSort(a, b)
        {
            // sort by FileExistsAtCurrent descending (so true is before false), group by Run/Protocol/Name (ascending)

            if (a['FileExistsAtCurrent'] > b['FileExistsAtCurrent']) return -1;
            else if (a['FileExistsAtCurrent'] < b['FileExistsAtCurrent']) return 1;

            if (a['Run/Protocol/Name'] < b['Run/Protocol/Name']) return -1;
            else if (a['Run/ProtocolName'] > b['Run/Protocol/Name']) return 1;

            else return 0;
        }
        this.rows.sort(rowsSort).sort;
    },

    attemptFixDataFilePaths : function()
    {
        this.getFixPathsButton().hide();
        this.getRunToolButton().disable();

        var selectedRowIds = [];
        jQuery('#nab-section-body input:checked').not('[disabled]').each(function()
        {
            selectedRowIds.push(jQuery(this).attr('data-rowid'));
        });
        var selectedRecords = this.getRecordsWithRowIds(selectedRowIds);
        var totalCount = selectedRecords.length;

        var unselectedRowIds = [];
        jQuery('#nab-section-body input:not(:checked)').not('[disabled]').each(function()
        {
            unselectedRowIds.push(jQuery(this).attr('data-rowid'));
        });
        var unselectedRecords = this.getRecordsWithRowIds(unselectedRowIds);

        this.fixesCompleted = 0;
        this.fixesFailed = 0;
        this.updateRunDataFileCountProgress(this.fixesCompleted, totalCount, false);
        this.getSearchProgressBar().show();

        Ext4.each(selectedRecords,function(record)  // process selected records
        {
            LABKEY.Ajax.request({
                url: LABKEY.ActionURL.buildURL('experiment', 'checkDataFile.api'),
                method: 'POST',
                params: {
                    rowId: record.get('RowId'),
                    attemptFilePathFix: true
                },
                scope: this,
                success: function(response){
                    var json = Ext4.decode(response.responseText);
                    if (json.hasOwnProperty('filePathFixed'))
                        record.set('FilePathFixed', json.filePathFixed);
                    if (json.hasOwnProperty('newDataFileUrl'))
                        record.set('NewDataFileUrl', json.newDataFileUrl);
                    record.set('StatusMessage', null);  // in case this was set for this record during a previous run

                    this.fixesCompleted++;
                    this.updateRunDataFileCountProgress(this.fixesCompleted + this.fixesFailed, totalCount, false);

                    if (this.fixesCompleted + this.fixesFailed == totalCount)
                    {
                        this.cleanUpAfterFixes(this.fixesCompleted, unselectedRecords.length + this.fixesFailed);
                    }
                },
                failure: function(response){
                    record.set('StatusMessage', 'File skipped - error occurred');

                    this.fixesFailed++;
                    this.updateRunDataFileCountProgress(this.fixesCompleted + this.fixesFailed, totalCount, false);

                    if (this.fixesCompleted + this.fixesFailed == totalCount)
                    {
                        this.cleanUpAfterFixes(this.fixesCompleted, unselectedRecords.length + this.fixesFailed);
                    }
                }
            });
        }, this);

        Ext4.each(unselectedRecords,function(record)  // process unselected records
        {
            record.set('StatusMessage', 'File skipped');
        }, this);

        if(selectedRecords.length === 0)  // need to clean up, since for-each won't run
        {
            this.updateRunDataFileCountProgress(0, 0, false);
            this.cleanUpAfterFixes(this.fixesCompleted, unselectedRecords.length + this.fixesFailed);
        }
    },

    cleanUpAfterFixes : function(totalUpdated, totalSkipped)
    {
        this.getRunToolButton().enable();
        this.getFixPathsButton().show();
        this.getFilesFoundHeaderView().update({
            heading: this.getFilesFoundHeaderView().getHeading(),  // otherwise it will be erased
            sectionTotalUpdated: totalUpdated,
            sectionTotalSkipped: totalSkipped,
            hasRun: true  // show heading
        });
        this.getFilesNotFoundHeaderView().update({
            heading: this.getFilesNotFoundHeaderView().getHeading(),  // otherwise it will be erased
            hasRun: true  // show heading
        });
        this.getFilesFoundBodyView().getStore().sync();
    },

    // n^2 comparison, can speed up with hashmap lookup if needed
    getRecordsWithRowIds: function(rowIds)
    {
        return this.getRunDataFilesFoundStore().queryBy(function(record)
        {
            var recordRowId = record.get('RowId');
            for(var i = 0; i < rowIds.length; i++)
            {
                var selectedRowId = parseInt(rowIds[i]);
                if (recordRowId === selectedRowId)
                {
                    return true;
                }
            }
            return false;
        }).items;
    }
});