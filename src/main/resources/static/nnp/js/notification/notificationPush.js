$(document).ready(function () {

	const table = new DataTable("#notificationPushTable", {
        columns: [
            { data: null, width: "5%", className: "dt-head-center dt-body-center" },
            { data: "senderId", width: "10%" },
            { data: "nationalityName", width: "15%"},
            { data: "receiveCount", width: "10%"},
            { data: "content"},
            {
                data: "sendDate",
                width: "15%", className: "dt-head-center dt-body-center",
                render: function (data) {
                    return moment(data).format("YYYY-MM-DD hh:mm:ss");
                }
            },
            {data: "id", visible: false },
        ],
        rowCallback: function(row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        },
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
	});

    $("#search-btn").on("click", function() {
        searchTable(table, "#searchText", 2)
        searchTable(table, "#customerSearchNationalityInput", 1)
    })
    $("#sendToAllSelect").on("change", function() {
        table.draw();
    })
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    $.ajax({
        url: '/api/country/load',
        type: "GET",
        success: function (response) {
            let options = '<option value="">Selected Nationality</option>'
            response.forEach(function (item) {
                options += `<option ${$("#customerSearchNationalityInput").val() == item.id ? 'Selected Nationality' : ''} value="${item.name}">${item.name}</option>`
            })
            $("#customerSearchNationalitySelect select").append(options);
        },
        error: function (xhr, status, error) {
            console.error("Error deleting Customer:", error); // 에러 로그 출력
            alert("Failed to delete the customer. Please try again.");
        }
    });
    $("#customerSearchNationalitySelect select").on("change", function () {
        $("#customerSearchNationalityInput").val($(this).val());
    })

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});