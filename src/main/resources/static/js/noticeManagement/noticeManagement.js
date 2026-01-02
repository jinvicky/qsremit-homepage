$(document).ready(function() {

    const today = moment();
    const formattedDate = today.format('YYYY-MM-DD');
    const formattedOneWeekAgo = moment().subtract(1, 'months').format('YYYY-MM-DD');
    $("#noticeStartDate").val(formattedOneWeekAgo);

    $('[data-plugin="knob"]').knob();

    const noticeTable = $('#noticeManagementTable').DataTable({
        dom: '<"top mb-2"l><"clear">rt<"bottom d-flex justify-content-between mt-2"ip>',
        columns: [
            {
                data: 'noticeId',
                render: function (data) {
                    return data ? `#${data}` : '';
                },
                defaultContent: '',
                width: '5%'
            },
            { data: 'title', defaultContent: "", width: '30%' },
            { data: 'user', defaultContent: "" },
            {
                data: 'createDate',
                defaultContent: "",
                render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD HH:mm') : '';
                }
            },
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
            url: "/noticeManagement",
            type: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
            },
            success: function (data) {
                noticeTable.clear();
                noticeTable.rows.add(data);
                noticeTable.draw();

                $("#noticeStartDate").datepicker('update', startDate);
                $("#noticeEndDate").datepicker('update', endDate);
            },
            error: function (xhr, error) {
                console.error("Error:", error);
            }
        })
    }

    fetchData(formattedOneWeekAgo, formattedDate);


    $('#search-btn').on('click', async function() {
        await fetchData($("#issueStartDate").val(), $("#issueEndDate").val());

        noticeTable.search($('#globalSearch').val()).draw()
    });

    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    /**
     * notice Detail Page
     */
    $('#noticeManagementTable tbody').on('click', 'tr', function () {
        const rowData = noticeTable.row(this).data();
        if (!rowData) {
            return;
        }
        window.location.href = '/noticeManagement/detail?noticeId=' + rowData.noticeId;
    });

    noticeTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        noticeTable.page.len(pageLength);
    }, 0);
});
