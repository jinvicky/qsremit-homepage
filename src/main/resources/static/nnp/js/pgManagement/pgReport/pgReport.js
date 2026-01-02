$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    $('#searchMonth').datepicker({
        format: "yyyy-mm",
        minViewMode: "months",
    });

    let currentDate = new Date();
    let monthInput = $('#searchMonthInput').val();

    let selectedMonth = !monthInput || monthInput === "" ? moment(currentDate).subtract(1, 'month').format('YYYY-MM') : monthInput;
    let selectedMonthDate = `${selectedMonth}-01`

    $('#searchMonth').datepicker('update', selectedMonth);

    function getMonth() {
        const month = $('#searchMonth').val();
        selectedMonth = `${moment(month).format('YYYY-MM')}`;
        selectedMonthDate = `${selectedMonth}-01`
        $("#dateTitle").text(`${selectedMonth}`);
    }
    getMonth();

    // 검색 이벤트
    $("#searchMonth").on("change", function () {
        getMonth();
        $('#searchMonthInput').val($('#searchMonth').val());
        fetchData(selectedMonthDate);
    })

    const fetchData = (month) => {
        $.ajax({
            url: '/api/pgManagement/pgReport/',
            type: 'GET',
            data: {
                month: month,
            },
            dataType: 'json',
            success: function (data) {
                const tbody = $('#pgReportTableBody');
                tbody.empty();

                if (Array.isArray(data) && data.length > 0) {

                    data.forEach((item) => {
                        const emailList = item.customerEmail.split("&#44;").map(v => v.trim());

                        tbody.append(`
                        <tr data-type-id="${item.accountDepositTypeId}"
                            data-type-name="${item.customerType}">
                            <td class="text-center">${item.receiptNo}</td>
                            <td class="text-center">${unescapeSpecialCharacters(item.customerType)}</td>
                            <td class="text-center">
                                ${emailList.map(email => `<p class="mb-0">${email}</p>`).join("")}
                            </td>
                            <td class="text-center">${item.monthlySettlementAmount.toLocaleString()}</td>
                            <td class="text-center">
                                <button type="button"
                                        class="btn validationBtn btn-primary waves-effect waves-light btn-detail"
                                        data-bs-toggle="modal"
                                        data-bs-target="#printOptionsModal">
                                    Validation
                                </button>
                            </td>
                        </tr>
                        `);
                    });
                } else {
                    tbody.append('<tr><td colspan="7">No data available.</td></tr>');
                }
            },
            error: function (xhr, status, error) {
                console.log("[Daily Summary] Error Message:", error);
            }
        })
    }

    fetchData(selectedMonthDate);

    /**
     * 모달창
     */
    let companyName, companyEmail, companyNo, accountDepositTypeId;
    $('#pgReportTable').on('click', '.validationBtn', function() {
        const customerTypeId = $(this).closest('tr').data("type-id");
        const customerTypeName = $(this).closest('tr').data("type-name");
        $('.modal-title').text(`${unescapeSpecialCharacters(customerTypeName)} Report Preview`);
        getMonth();

        const reportNo = selectedMonth.replace(/-/g, '');
        const today = moment(currentDate).format('YYYY年 MM月 DD日');
        const startDate = moment(selectedMonthDate).format('YYYY年 MM月 01日');
        const endDate = moment(selectedMonthDate).endOf('month').format('YYYY年 MM月 DD日');

        // input value 초기화
        $("#receipt_memo").val("");
        $("#trans_memo").val("");

        $("#loadingSpinner").show();
        $.ajax({
            url: `/api/pgManagement/pgReport/detail`,
            type: 'GET',
            data: {
                customerTypeId: customerTypeId,
                month: selectedMonthDate
            },
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function(response) {
                $("#loadingSpinner").hide();
                console.log(response);

                companyName = `${unescapeSpecialCharacters(response.customerName)}`;
                companyEmail = response.customerEmail.split("&#44;").map(email => email.trim());
                companyNo = `${reportNo}${String(response.receiptNo).padStart(4, '0')}`;
                accountDepositTypeId = response.accountDepositTypeId

                const dailySummaryList = response.dailySummaryList;

                const monthly = {
                    feeJPY: response.monthlyFeeJPY ? response.monthlyFeeJPY : 0,
                    counts: response.monthlyCounts ? response.monthlyCounts : 0,
                    totalAmount: response.monthlyTotalAmount ? response.monthlyTotalAmount : 0,
                    totalPaymentAmount: response.monthlyTotalPaymentAmount ? response.monthlyTotalPaymentAmount : 0,
                    totalRefundAmount: response.monthlyTotalRefundAmount ? response.monthlyTotalRefundAmount : 0,
                    totalSettlementAmount: response.monthlySettlementAmount ? response.monthlySettlementAmount : 0,
                    finalTotalPayment: response.monthlyTotalPaymentAmount - response.monthlyTotalRefundAmount ?? 0
                }

                /* 1. RECEIPT */
                $('#receipt_companyName').text(`${companyName} 御中`);
                $('#receipt_no').text(`${companyNo}`);
                $('#receipt_printDate').text(`${today}`);
                $('#receipt_period').text(`${startDate}～${endDate}`);
                // 상단 수수료 총액
                $('#receipt_total').text(`${monthly.feeJPY.toLocaleString()} 円`);
                // 하단 총합
                $('#receipt_totalCount').text(`${monthly.counts.toLocaleString()}`);
                $('#receipt_totalAmount').text(`${monthly.totalAmount.toLocaleString()}`);
                $('#receipt_totalFee').text(`${monthly.feeJPY.toLocaleString()}`);
                $('#receipt_totalPayment').text(`${monthly.totalPaymentAmount.toLocaleString()}`);

                /* 2. 거래 내역 */
                $('#trans_companyName').text(`${companyName} 御中`);
                $('#trans_no').text(`${reportNo}${String(response.receiptNo).padStart(4, '0')}_1`);
                $('#trans_printDate').text(`${today}`);
                $('#trans_period').text(`${startDate}～${endDate}`);

                // 일별 하단 총합
                $('#trans_totalAmount').text(`${monthly.totalAmount.toLocaleString()}`);
                $('#trans_totalFee').text(`${monthly.feeJPY.toLocaleString()}`);
                $('#trans_totalPayment').text(`${monthly.totalPaymentAmount.toLocaleString()}`);
                $('#trans_totalRefund').text(`${monthly.totalRefundAmount.toLocaleString()}`);
                $('#trans_totalSettlementPayment').text(`${monthly.totalSettlementAmount.toLocaleString()}`);

                // 최종 총합 (환불 제외 금액)
                $('#trans_finalTotalAmount').text(`${monthly.totalAmount.toLocaleString()}`);
                $('#trans_finalTotalFee').text(`${monthly.feeJPY.toLocaleString()}`);
                $('#trans_finalTotalPayment').text(`${monthly.finalTotalPayment.toLocaleString()}`); // 환불 제외 금액
                $('#trans_finalTotalSettlementPayment').text(`${monthly.totalSettlementAmount.toLocaleString()}`);

                /* 일별 데이터 */
                let receiptBody = $('#receipt_transactionBody');
                receiptBody.empty();
                let transBody = $('#trans_transactionBody');
                transBody.empty();

                if (Array.isArray(dailySummaryList) && dailySummaryList.length > 0) {
                    dailySummaryList.forEach((item) => {
                        receiptBody.append(`
                        <tr>
                            <th class="text-center">${moment(item.depositDate).format('YYYY-MM-DD') ?? ""}</th>
<!--                            <th class="text-center"></th>-->
<!--                            <th class="text-center"></th>-->
<!--                            <th class="text-center"></th>-->
                            <th class="text-center">${item.counts ? item.counts.toLocaleString() : 0}</th>
                            <th class="text-center">${item.totalAmount ? item.totalAmount.toLocaleString() : 0}</th>
                            <th class="text-center">${item.feeJPY ? item.feeJPY.toLocaleString() : 0}</th>
                            <th class="text-center">${item.totalPaymentAmount ? item.totalPaymentAmount.toLocaleString() : 0}</th>
                        </tr>
                        `);
                    });

                    let settlementSum = 0;
                    dailySummaryList.forEach((item) => {
                        settlementSum += item.settlementAmount ?? 0;
                        transBody.append(`
                        <tr>
                            <th class="text-center">${moment(item.depositDate).format('YYYY-MM-DD') ?? ""}</th>
                            <th class="text-center">${item.totalAmount ? item.totalAmount.toLocaleString() : 0}</th>
                            <th class="text-center">${item.feeJPY ? item.feeJPY.toLocaleString() : 0}</th>
                            <th class="text-center">${item.totalPaymentAmount ? item.totalPaymentAmount.toLocaleString() : 0}</th>
                            <th class="text-center" style="color: red;">${item.totalRefundAmount > 0 ? `- ${item.totalRefundAmount.toLocaleString()}` : ""}</th>
                            <th class="text-center">${item.depositAt && item.depositAt !== "" ? moment(item.depositAt).format('YYYYMMDD') : ""}</th>
                            <th class="text-center">${item.exchangeRate && item.totalPaymentAmount !== 0 ? item.exchangeRate : 0}</th>
                            <th class="text-center">${item.settlementAmount ? item.settlementAmount.toLocaleString() : 0}</th>
                            <th class="text-center">${settlementSum.toLocaleString()}</th>
                        </tr>
                        `);
                    });
                    $('#trans_totalSettlementPaymentSum').text(`${settlementSum.toLocaleString()}`);
                }
            },
            error: function(xhr, status, error) {
                $("#loadingSpinner").hide();
                console.error('Failed:', error);
                alert('Cannot find data.');
            }
        });
    });

    /**
     * 출력 양식
     */
    if (!$('#printModalStyles').length) {
        $('head').append(`<style id="printModalStyles">${pgReportStyles}</style>`);
    }

    $("#confirmMail").on("click", async function () {
        $("#loadingSpinner").show();

        try {
            const pdf = await generatePdf()
            const pdfData = pdf.output('blob');

            const formData = new FormData();
            const blob = new Blob([pdfData], { type: 'application/pdf' });

            formData.append('file', blob, `[NNP QS Remit] INVOICE(${selectedMonth})_${companyName}(${companyNo}).pdf`);
            formData.append('to', companyEmail);
            formData.append('accountTypeId', accountDepositTypeId);
            formData.append('reportMonth', selectedMonth);
            formData.append('subject', `[NNP QS Remit] INVOICE(${selectedMonth}) ${companyName}(${companyNo}) 御中`);
            formData.append('payload', `
                <p>Dear ${companyName}.</p>
                <br>
                <p>Please find attached the Invoice PDF ${selectedMonth} (No: ${companyNo}).</p>
                <br>
                <p>Please Kindly review it.</p>
                <p>Thank you very much.</p>
                <br>
                <p>Best regards,</p>
                <p><b>N&P JAPAN CO.,LTD</b></p>
                <br>`);

            if (!companyName || !companyEmail || !companyNo) {
                alert('Please input company name, email or report number at Customer Type Management page.');
            } else {
                console.log("서버 전송", new Date())
                const response = await fetch('/api/pgManagement/pgReport/email', {
                    method: 'POST',
                    headers: {
                        [header]: token  // CSRF 토큰 추가
                    },
                    body: formData      // FormData 직접 전송
                });

                if (!response.ok) {
                    alert('Failed to send email.');
                } else {
                    console.log("메일 전송 완료", new Date())
                    alert("Email has been sent successfully.");
                }
            }
        } catch (error) {
            console.error('PDF 생성 또는 이메일 발송 실패:', error);
            alert('Failed to send email.');
        } finally {
            $("#loadingSpinner").hide();
            $('#printOptionsModal').modal('hide');
        }
    });

    $("#downloadPdf").on("click", async function () {
        $("#loadingSpinner").show();

        try {
            const pdf = await generatePdf()
            pdf.save(`[NNP QS Remit] INVOICE(${selectedMonth})_${companyName}(${companyNo}).pdf`);
        } catch (e) {
            console.error('PDF 다운로드 실패:', error);
            alert('Failed to download PDF.');
        } finally {
            $("#loadingSpinner").hide();
        }
    })

    async function generatePdf() {
        try {
            $("#receipt_memo").attr("placeholder", "");
            $("#trans_memo").attr("placeholder", "");

            const {jsPDF} = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");
            const a4Divs = document.querySelectorAll(".a4");
            for (let i = 0; i < a4Divs.length; i++) {
                const canvas = await html2canvas(a4Divs[i], {
                    scale: 2,
                    useCORS: true,
                });
                const imgData = canvas.toDataURL("image/jpeg", 0.6);

                // 크기 조절
                const a4Width = 210;
                const a4Height = 297;
                const margin = 5;
                const usableWidth = a4Width - margin * 2;
                const usableHeight = a4Height - margin * 2;
                const imgWidth = canvas.width * 0.264583;
                const imgHeight = canvas.height * 0.264583;
                const scale = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
                const newWidth = imgWidth * scale;
                const newHeight = imgHeight * scale;
                const x = (a4Width - newWidth) / 2;
                const y = (a4Height - newHeight) / 2;

                if (i > 0) {
                    pdf.addPage(); // 두 번째 div부터는 새 페이지 추가
                }
                pdf.addImage(imgData, "JPEG", x, y, newWidth, newHeight);
            }
            isGeneratePdf = true;
            return pdf;
        } catch (error) {
            isGeneratePdf = false;
            console.error('PDF 생성 실패:', error);
            alert('Failed to generate PDF.');
        }
    }
});