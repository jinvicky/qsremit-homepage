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

    // Nationality 불러오기
    $.ajax({
        url: `/api/country/load`,
        type: "GET",
        success: function (response) {
            let options = '<option value="">Select</option>';
            response.forEach(function (item) {
                options += `<option ${$("#emailManagementNationalityInput").val() == item.name ? 'selected' : ''} value="${item.name}">${item.name}</option>`;
            });
            $("#emailManagementNationality").html(options);
        },
        error: function (xhr, status, error) {
            console.error("Error loading options:", error);
        }
    });

    // Table 초기화
    const emailTable = $('#emailManagementTable').DataTable({
        data: [],
        columns: [
            { data: null, title: "No.", width: "5%", className: "dt-head-center dt-body-center" },
            { data: "senderId", title: "Sender", width: "10%" },
            {
                data: "nationality",
                title: "Nationality" ,
                width: "10%",
                render: function (data) {
                    return data ? data : "";
                }
            },
            { data: "receiveCount", title: "Number of shipments", width: "10%" },
            { data: "title", title: "Title"},
            {
                data: "sendDate",
                title: "Send Date",
                width: "15%",
                className: "dt-head-center dt-body-center",
                render: function (data) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            { data: "id", visible: false },
            { data: "content", visible: false },
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
        initComplete: function () {
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    })

    // Row 클릭시 모달창 오픈
    emailTable.on("click", "tbody tr", function () {
        const row = emailTable.row($(this).closest("tr"));
        const emailContentDetail = row.data(); // Row Data를 가져옵니다.

        // 모달창 오픈
        const modalEl = document.getElementById("emailManagementDetail");
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
                url: "/api/systemManagement/emailManagement/receivers",
                data: {sendId: id},
                success: function (data) {
                    console.log(data);
                    const receivers = $("#receiverList");
                    const noReceiver = "Can't found receiver.";
                    const maxDisplayCount= 10;

                    $("#sendDate").text(moment(emailContentDetail.sendDate).format("YYYY-MM-DD HH:mm:ss"));
                    $("#sender").text(emailContentDetail.senderId);
                    $("#emailTitle").text(emailContentDetail.title);
                    $("#emailContent").html(emailContentDetail.content);

                    if (data.length !== 0) {
                        receivers.empty();
                        const totalReceivers = data.length;
                        const firstBatch = data.slice(0, maxDisplayCount);
                        const remainingBatch = data.slice(maxDisplayCount);

                        firstBatch.forEach(item => {
                            receivers.append(item.receiver);
                            receivers.append(' ');
                        })

                        if (remainingBatch.length > 0) {
                            const moreButton = $("<button class='btn btn-link'>...more</button>");
                            const hiddenReceivers = $("<div class='d-none'></div>");
                            remainingBatch.forEach(item => {
                                hiddenReceivers.append(item.receiver);
                                hiddenReceivers.append(' ');
                            })

                            moreButton.on("click", function (){
                                hiddenReceivers.toggleClass("d-none");
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
                    alert("An error occurred while fetching the data.");
                }
            })
        }

        resetModalData();
        fetchReceiversData(emailContentDetail.id);

    });

    // 데이터 가져오기
    const fetchLogData = (startDate, endDate, nationality) => {
        $.ajax({
            url: "/api/systemManagement/emailManagement/", // 변경
            type: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
                nationality: nationality,
            },
            success: function (data) {
                emailTable.clear();
                emailTable.rows.add(data);
                emailTable.draw();

                $("#startDate").datepicker('update', startDate);
                $("#endDate").datepicker('update', endDate);
                $("#emailManagementNationality").val(nationality);
            },
            error: function (xhr, error) {
                console.error("Error:",error);
                alert("An error occurred while fetching the data.");
            }
        })
    }

    fetchLogData(formattedOneMonthAgo, formattedDate, null);

    $("#searchBtn").on("click", function() {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();
        const nationality = $("#emailManagementNationality").val();

        fetchLogData(startDate, endDate, nationality);
    })
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });

    emailTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        emailTable.page.len(pageLength);
    }, 0);
})
