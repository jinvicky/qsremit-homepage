$(document).ready(function() {

    const today = moment();
    const formattedDate = today.format('YYYY-MM-DD');
    const formattedOneWeekAgo = moment().subtract(1, 'months').format('YYYY-MM-DD');
    $("#issueStartDate").val(formattedOneWeekAgo);

    $('[data-plugin="knob"]').knob();

    const issueTable = $('#issueManagementTable').DataTable({
        dom: '<"top mb-2"l><"clear">rt<"bottom d-flex justify-content-between mt-2"ip>',
        columns: [
            { data: 'priority', defaultContent: "", width: '5%'},
            {
                data: 'issueId',
                render: function (data) {
                    return data ? `#${data}` : '';
                },
                defaultContent: '',
                width: '5%'
            },
            { data: 'title', defaultContent: "", width: '30%' },
            { data: 'category', defaultContent: "" },
            { data: 'type', defaultContent: "",
                className: 'text-center',
                render: function(data) {
                    if (!data) return "";
                    switch(data) {
                        case 'Bug':
                            return '<i class="ri-bug-fill" style="font-size: 20px;"></i>';
                        case 'Improve':
                            return '<i class="ri-refresh-line" style="font-size: 20px;"></i>';
                        case 'New Feature':
                            return '<i class="ri-star-s-fill" style="font-size: 20px;"></i>';
                        case 'Support':
                            return '<i class="ri-chat-3-line" style="font-size: 20px;"></i>';
                        case 'Security':
                            return '<i class="ri-shield-line" style="font-size: 20px;"></i>';
                        case 'Delete':
                            return '<i class="ri-delete-bin-line" style="font-size: 20px;"></i>';
                        case 'Others':
                            return '<i class="ri-more-fill" style="font-size: 20px;"></i>';
                        default:
                            return "";
                    }
                }
            },
            { data: 'user', defaultContent: "" },
            { data: 'status', defaultContent: "",
                className: 'text-center',
                render: function(data) {
                    if (!data) return "";
                    switch(data) {
                        case 'New':
                            return '<span class="badge bg-warning rounded-pill">New</span>';
                        case 'Pending':
                            return '<span class="badge bg-secondary text-light rounded-pill">Pending</span>';
                        case 'In Progress':
                            return '<span class="badge bg-primary rounded-pill">In Progress</span>';
                        case 'Rejected':
                            return '<span class="badge bg-danger rounded-pill">Rejected</span>';
                        case 'Completed':
                            return '<span class="badge bg-success rounded-pill">Completed</span>';
                        default:
                            return "";
                    }
                }
            },
            {
                data: 'createDate',
                defaultContent: "",
                render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD HH:mm') : '';
                }
            },
            {
                data: 'endDate',
                defaultContent: "",
                render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD HH:mm') : '';
                }
            },
            // { data: 'file', defaultContent: "" },
            { data: 'type', defaultContent: "", visible: false },
            { data: 'status', defaultContent: "", visible: false },
        ],
        columnDefs: [
            {
                targets: 0,
                createdCell: function (td, cellData) {
                    if (cellData === 'High') {
                        $(td).css('background-color', '#f8d7da'); // 연한 빨강
                    } else if (cellData === 'Medium') {
                        $(td).css('background-color', '#fff3cd'); // 연한 노랑
                    } else if (cellData === 'Low') {
                        $(td).css('background-color', '#d4edda'); // 연한 초록
                    }
                }
            }
        ],
        order: [],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        paging: true,
        initComplete: function () {
            $('#customNewButton').appendTo('#issueManagementTable_wrapper .dataTables_filter');
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    });
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchText").trigger("keyup");
        }
    });

    const fetchData = (startDate, endDate) => {
        $.ajax({
            url: "/issueManagement",
            type: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
            },
            success: function (data) {
                issueTable.clear();
                issueTable.rows.add(data);
                issueTable.draw();

                $("#issueStartDate").datepicker('update', startDate);
                $("#issueEndDate").datepicker('update', endDate);
            },
            error: function (xhr, error) {
                console.error("Error:", error);
            }
        })
    }

    fetchData(formattedOneWeekAgo, formattedDate);

    handleCheckedAll('#allStatusCheck', '.searchStatus')
    handleCheckedAll('#allTypeCheck', '.searchType')

    function handleCheckedAll(allCheckedId, checkedClassName) {
        $(allCheckedId).on('click', function () {
            $(checkedClassName).prop('checked', this.checked);
        })
        $(checkedClassName).on('change', function () {
            const allChecked = $(checkedClassName).length === $(`${checkedClassName}:checked`).length;
            $(allCheckedId).prop('checked', allChecked);
        });
    }

    $('#search-btn').on('click', async function() {
        await fetchData($("#issueStartDate").val(), $("#issueEndDate").val());
        searchTable(issueTable, "#searchPriority", 0)
        searchTable(issueTable, "#searchCategory", 3)

        const selectedTypes = $('.searchType:checked').map(function() {
            return this.value;
        }).get();
        const typePattern = selectedTypes.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
        issueTable.column(9).search(typePattern, true, false).draw();

        const selectedStatus = $('.searchStatus:checked').map(function() {
            return this.value;
        }).get();
        const statusPattern = selectedStatus.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
        issueTable.column(10).search(statusPattern, true, false).draw();

        issueTable.search($('#globalSearch').val()).draw()
    });

    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    /**
     * Issue Detail Page
     */
    $('#issueManagementTable tbody').on('click', 'tr', function () {
        const rowData = issueTable.row(this).data();
        if (!rowData) {
            return;
        }
        window.location.href = '/issueManagement/detail?issueId=' + rowData.issueId;
    });

    issueTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        issueTable.page.len(pageLength);
    }, 0);
});
