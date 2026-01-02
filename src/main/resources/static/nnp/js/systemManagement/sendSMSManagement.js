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

    let receiverList = [];
    const size = 10;
    const type = "mobile";
    function updateReceiverCount() {
        $("#receiveCount").empty();
        $("#receiveCount").text(receiverList.length);
        if (receiverList.length === 0) {
            $("#selectedReceiverId").val("")
        } else {
            $("#selectedReceiverId").hide();
            $("#selectedReceiverId").val(selectedReceiverId);
        }

    }

    // 버튼 클릭 서치
    $("#senderSearchButton").on("click", function () {
        const searchField = $("#SenderSearchFieldSelect").val();
        const keyword = $("#senderSearchInput").val().trim();
        if (!keyword) {
            alert("Please enter a search term.");
            return;
        }

        receiverList = [];
        updateReceiverCount();
        $("#selectAll").prop("checked", false);

        try {
            loadPage(0, "", searchField, keyword, size, type);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    });
    $("#senderSearchInput").on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#senderSearchButton").trigger("click");
        }
    });

    // 고객 전체 선택
    $("#selectAll").on("change", function () {
        const isChecked = $(this).is(":checked");
        const checkedMobiles = [];
        $("#selectReceiverTable tbody").find("input[type='checkbox']").each(function () {
            if (!$(this).prop("disabled")) {
                $(this).prop("checked", isChecked);

                const mobile = $(this).data("mobile");
                if (isChecked && mobile && !receiverList.includes(mobile)) {
                    checkedMobiles.push(mobile);
                } else if (!isChecked) {
                    receiverList = receiverList.filter(existingMobile => existingMobile !== mobile);
                }
            }
        });

        if (isChecked) {
            receiverList = [...new Set([...receiverList, ...checkedMobiles])]; // 중복 방지
        }

        updateReceiverCount();
    });

    // row 클릭으로 고객 선택
    $("#selectReceiverTable tbody").on("click", "tr", function (e) {
        if (e.target.tagName !== "INPUT") {
            const $checkbox = $(this).find("input[type='checkbox']");
            if ($checkbox.prop("disabled")) {
                return;
            }
            const isChecked = $checkbox.prop("checked");
            $checkbox.prop("checked", !isChecked);

            const rowData = {
                id: $(this).attr("data-id"),
                mobile: $(this).attr("data-mobile")
            };

            if (!isChecked) {
                if (!receiverList.includes(rowData.mobile)) {
                    receiverList.push(rowData.mobile);
                }
            } else {
                receiverList = receiverList.filter(mobile => mobile !== rowData.mobile);
            }

            updateReceiverCount();
        }
    });

    // 체크박스 클릭으로 고객 선택
    $("#selectReceiverTable tbody").on("change", "input[type='checkbox']", function () {
        const $checkbox = $(this);
        if ($checkbox.prop("disabled")) {
            return;
        }
        const isChecked = $(this).is(":checked");
        const checkboxData = {
            id: $(this).data("id"),
            mobile: $(this).data("mobile")
        };

        if (isChecked) {
            if (!receiverList.includes(checkboxData.mobile)) {
                receiverList.push(checkboxData.mobile);
            }
        } else {
            receiverList = receiverList.filter(mobile => mobile !== checkboxData.mobile);
        }

        updateReceiverCount();
    });

    // textarea의 입력 내용 길이를 체크
    $("#SMSContent").on("input", function () {
        let currentLength = $(this).val().length;

        $("#SMSContentLength").text(currentLength);
        if (currentLength < 70) {
            $("#SMSContentMessage").removeClass("text-danger").addClass("text-muted");
            $("#SMSContentMax").text(70);
        } else if (currentLength > 70 && currentLength < 132) {
            $("#SMSContentMessage").removeClass("text-muted").addClass("text-danger");
            $("#SMSContentMax").text(132);
        } else if (currentLength > 132 && currentLength < 198) {
            $("#SMSContentMax").text(198);
        } else if (currentLength > 198) {
            $("#SMSContentMax").text(264);
        }
    });

    // SMS 전송
    $("form").submit(function (event) {
        event.preventDefault();
        const formData = {
            payload: $("#SMSContent").val(),
            receiver: receiverList // Array
        }

        if (!confirm("Are you sure you want to send SMS to " + receiverList.length + " recipient?\n\n")){ return; }
        $.ajax({
            url: "/api/systemManagement/sendSMSManagement/send",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (response) {
                alert("SMS has been sent successfully.");
                window.location.href = "/systemManagement/SMSManagement";
            },
            error: function (error) {
                console.log(error);
                alert("Failed to send SMS. Please try again later.");
            }
        })

    })

})
