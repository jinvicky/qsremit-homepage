$(document).ready(function () {
    // CSRF TOKEN
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    // ajax 초기화
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    // 검색 기간 기준 설정

    const today = moment();
    const formattedDate = today.format('YYYY-MM-DD');

    const formattedOneMonthAgo = moment().subtract(1, 'month').format('YYYY-MM-DD');

    // Table 초기화
    const SMSTable = $('#SMSManagementTable').DataTable({
        data: [],
        columns: [
            { data: null, title: "No.", width: "5%", className: "dt-head-center dt-body-center" },
            { data: "receiveCount", title: "Number of shipments", width: "10%" },
            { data: "senderId", title: "Sender", width: "10%" },
            { data: "content", title: "Content"},
            {
                data: "sendDate",
                title: "Send Date",
                width: "15%", className: "dt-head-center dt-body-center",
                render: function (data) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                },
            },
            { data: "id", visible: false },
        ],
        rowCallback: function (row, data, index) { // Numbering Option
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        },
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        searching: false,
        autoWidth: false,
        initComplete: function () {
            initializeTableResize(this, {
                minWidth: 30,
                excludeLastColumns: 1
            })
        }
    })

    // Row 클릭시 모달창 오픈
    SMSTable.on("click", "tbody tr", function () {
        const row = SMSTable.row($(this).closest("tr"));
        const SMSContentDetail = row.data(); // Row Data를 가져옵니다.

        // 모달창 오픈
        const modalEl = document.getElementById("SMSManagementDetail");
        let modal = bootstrap.Modal.getInstance(modalEl);

        if (!modal) {
            modal = new bootstrap.Modal(modalEl);
        }
        modal.show();

        // 모달 초기화
        const resetModalData = () => {
            $("#sendDate").text("");
            $("#sender").text("");
            $("#emailTitle").text("");
            $("#emailContent").text("");
            $("#receiverList").empty(); // 이전 수신자 목록 삭제
        };

        const fetchReceiversData = (id) => {
            $.ajax({
                url: "/api/systemManagement/sendSMSManagement/receivers",
                data: {sendId: id},
                success: function (data) {
                    const receivers = $("#receiverList");
                    const noReceiver = "Can't found receiver.";
                    const maxDisplayCount= 5;

                    $("#sendDate").text(moment(SMSContentDetail.sendDate).format("YYYY-MM-DD HH:mm:ss"));
                    $("#sender").text(SMSContentDetail.senderId);
                    $("#SMSContent").text(SMSContentDetail.content);

                    if (data.length !== 0) {
                        receivers.empty();
                        const totalReceivers = data.length;
                        const firstBatch = data.slice(0, maxDisplayCount);
                        const remainingBatch = data.slice(maxDisplayCount);

                        firstBatch.forEach(item => {
                            const mobile = $("<div class='receiver-item'></div>").text(item.receiver);
                            const circle = $("<span> ●</span>");

                            if (item.status === "delivered") {
                                circle.addClass("text-success");
                            } else if (item.status === "pending") {
                                circle.addClass("text-warning");
                            } else {
                                circle.addClass("text-danger");
                            }

                            mobile.append(circle);
                            receivers.append(mobile);
                        });

                        if (remainingBatch.length > 0) {
                            const moreButton = $("<button class='btn btn-link'>...more</button>");
                            const hiddenReceivers = $("<div class='hidden-receivers d-none'></div>");
                            remainingBatch.forEach(item => {
                                const mobile = $("<div class='receiver-item'></div>").text(item.receiver);
                                const circle = $("<span> ●</span>");

                                if (item.status === "delivered" || item.status === "pending") {
                                    circle.addClass("text-success");
                                } else if (item.status === "failed") {
                                    circle.addClass("text-danger");
                                }

                                mobile.append(circle);
                                hiddenReceivers.append(mobile);
                            });

                            moreButton.on("click", function () {
                                hiddenReceivers.toggleClass("d-none"); // 숨김/표시 전환
                                if (hiddenReceivers.hasClass("d-none")) {
                                    moreButton.text("...more");
                                } else {
                                    moreButton.text("fold");
                                }
                            });
                            receivers.append(hiddenReceivers);
                            receivers.append(moreButton);
                        }

                    } else {
                        $("#receiver").text(noReceiver).addClass("text-danger");
                    }
                },

                error: function (xhr, error) {
                    console.error("Error:",error);
                    alert(error)
                    // alert("An error occurred while fetching the data.");
                }
            })
        }

        resetModalData();
        fetchReceiversData(SMSContentDetail.id);
    });

    // 데이터 가져오기
    const fetchLogData = (startDate, endDate) => {
        $.ajax({
            url: "/api/systemManagement/sendSMSManagement/",
            type: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
            },
            success: function (data) {
                SMSTable.clear();
                SMSTable.rows.add(data);
                SMSTable.draw();

                $("#startDate").datepicker('update', startDate);
                $("#endDate").datepicker('update', endDate);
            },
            error: function (xhr, error) {
                console.error("Error:",error);
                alert("An error occurred while fetching the data.");
            }
        })
    }

    fetchLogData(formattedOneMonthAgo, formattedDate, "");

    $("#searchBtn").on("click", function() {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();

        fetchLogData(startDate, endDate);
    })
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });

    SMSTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        SMSTable.page.len(pageLength);
    }, 0);
})
