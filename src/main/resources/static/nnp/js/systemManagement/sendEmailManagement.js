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

    // quill 에디터 초기화
    const quill = new Quill('#emailEditor', {
        theme: 'snow',
        placeholder: 'Enter the email contents here. \nSome special characters are not allowed and may not display properly: & < > " \' % + / \\ ,',
        modules: {
            toolbar: [
                [{ 'size': ['small', false, 'large', 'huge'] }],
                // [{ 'header': 1 }, { 'header': 2 }],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'color': [] }],
                ['image']
            ]
        }
    });

    quill.on('text-change', function () {
        const html = quill.root.innerHTML.trim();
        const cleanHtml = html === '<p><br></p>' ? '' : html;
        document.getElementById('emailContent').value = cleanHtml;
    });

    let receiverList = [];
    let receiverNationality = "";
    const size = 10;
    const type = "email";

    // Nationality 불러오기
    $.ajax({
        url: `/api/country/load`,
        type: "GET",
        success: function (response) {
            let options = '<option value="">Select</option>';
            response.forEach(function (item) {
                options += `<option ${$("#receiverNationalityInput").val() == item.name ? 'selected' : ''} value="${item.name}">${item.name}</option>`;
            });
            $("#receiverNationalitySelect").html(options);
        },
        error: function (xhr, status, error) {
            console.error("Error loading options:", error);
        }
    });

    function updateReceiverCount() {
        $("#receiveCount").empty();
        $("#receiveCount").text(receiverList.length);
        if (receiverList.length === 0) {
            $("#selectedReceiverId").val("0");
        } else {
            $("#selectedReceiverId").hide();
            $("#selectedReceiverId").val(selectedReceiverId);
        }

    }

    // 버튼 클릭 서치
    $("#senderSearchButton").on("click", function () {
        const searchField = $("#SenderSearchFieldSelect").val();
        const keyword = $("#senderSearchInput").val().trim();
        const nationality = $("#receiverNationalitySelect").val();
        if (!keyword) {
            alert("Please enter a search term.");
            return;
        }

        receiverList = [];
        updateReceiverCount();
        $("#selectAll").prop("checked", false);

        try {
            loadPage(0, nationality, searchField, keyword, size, type);
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
        const checkedEmails = [];
        $("#selectReceiverTable tbody").find("input[type='checkbox']").each(function () {
            if (!$(this).prop("disabled")) {
                $(this).prop("checked", isChecked);

                const email = $(this).data("email");
                if (isChecked && email && !receiverList.includes(email)) {
                    checkedEmails.push(email);
                } else if (!isChecked) {
                    receiverList = receiverList.filter(existingEmail => existingEmail !== email);
                }
            }
        });

        if (isChecked) {
            receiverList = [...new Set([...receiverList, ...checkedEmails])]; // 중복 방지
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
                email: $(this).attr("data-email")
            };

            if (!isChecked) {
                if (!receiverList.includes(rowData.email)) {
                    receiverList.push(rowData.email);
                }
            } else {
                receiverList = receiverList.filter(email => email !== rowData.email);
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
            email: $(this).data("email")
        };

        if (isChecked) {
            if (!receiverList.includes(checkboxData.email)) {
                receiverList.push(checkboxData.email);
            }
        } else {
            receiverList = receiverList.filter(email => email !== checkboxData.email);
        }

        updateReceiverCount();
    });

    // 이메일 전송
    $("form").submit(function (event) {
        event.preventDefault();

        const content = quill.root.innerHTML;

        const formData = {
            title: $("#emailTitle").val(),
            payload: content,
            receiver: receiverList, // Array
            nationality: receiverNationality
        }

        if (!confirm("Are you sure you want to send email to " + receiverList.length + " recipient?\n\n")){ return; }
        $.ajax({
            url: "/api/systemManagement/emailManagement/send",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (response) {
                alert("Email has been sent successfully.");
                window.location.href = "/systemManagement/emailManagement";
            },
            error: function (error) {
                alert("Failed to send Email. Please try again later.");
            }
        })

    })

})
