$(document).ready(function () {

    const today = moment();
    const formattedDate = today.format('YYYY-MM-DD');

    const formattedOneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');

    document.getElementById("startDate").value = formattedOneWeekAgo;
    document.getElementById("endDate").value = formattedDate;

    const table = new DataTable("#userLogHistoryTable", {
        columns: [
            {data: "id", title: "No.", width: "5%" }, // 넘버링 열
            {data: "userLoginedId", title: "User ID"},
            {data: "userEventType", title: "Event"},
            {
                data: "userEventCategory",
                title: "Event Category",
                render: function (data) {
                    if (data) {
                        return data.charAt(0).toUpperCase() + data.slice(1).replace(/(?<!^)([A-Z])/g, ' $1');
                    } else return "-"
                }
            },
            {
                data: "ipAddress",
                title: "IP Address",
                render: function (data) {
                    if (data == null) return "-";
                    return data === "0:0:0:0:0:0:0:1" ? "localhost" : data;
                }
            },
            {
                data: "logTime",
                title: "Date",
                width: "15%",
                render: function (data) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                data: "userEventUpdateDetail",
                title: "Changes Detail",
                render: function (data) {
                    return data ? data : "-";
                }
            },
            {
                data: "status",
                title: "Status",
                width: "7%",
                render: function (data) {
                    return data ? data : "Not logged";
                }
            },
            {
                data: "clientType",
                title: "Client Type",
                width: "5%",
                render: function (data) {
                    return data ? data : "-";
                }
            },

        ],
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        },
        columnDefs: [
            { targets: [0, 5, 7, 8], className: "dt-head-center dt-body-center" }
        ],
        paging: true,
        searching: false,
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        order: [[5, "desc"]],
        initComplete: function () {
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    });

    const fetchLogData = (startDate, endDate) => {
        $('#loadingSpinner').show();

        const userEvent = [];
        $(".searchStatus:checked").each(function () {
            userEvent.push($(this).val());
        });

        const userId = $("#userId").val();
        const status = $("#statusSelect").val();
        const eventCategory = $("#EventCategory").val();
        const clientType = $("input[name=clientType]:checked").val();

        $.ajax({
            url: "/api/user/userLogHistory",
            type: "GET",
            data: {
                userId: userId,
                startDate: startDate,
                endDate: endDate,
                userEvent: userEvent,
                eventCategory: eventCategory,
                status: status,
                client: clientType
            },
            success: function (data) {

                table.clear();
                table.rows.add(data);
                table.draw();

                $("#userEvent").val(userEvent);
                $("#startDate").datepicker('update', startDate);
                $("#endDate").datepicker('update', endDate);
                $("#userId").val(userId);
            },
            error: function (xhr, error) {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
            },
            complete: function () {
                $('#loadingSpinner').hide();
            }
        })
    }

    fetchLogData(formattedOneWeekAgo, formattedDate);

    $("#searchBtn").on("click", function () {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();

        fetchLogData(startDate, endDate);
    })

    $(document).on("keypress", function(event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            event.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});