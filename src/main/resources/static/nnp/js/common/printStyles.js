function formatTransactionPrint(date, partnerId) {
    // Paid 설정
    let dateText = date;
    const dateArr = date
        .split('<br>')
        .map(s => s.trim())
        .filter(s => s !== "")
        .map(item => {
            const [date, name] = item.split('|').map(v => v.trim());
            return { date, name };
        });

    if (dateArr.length === 3 && dateArr[2].name === '-') {
        dateArr[2].name = 'PAID'
        dateText = dateArr.map(d => `${d.date} | ${d.name}`)
            .join('<br>') + '<br>';
    }

    // 송금인 정보
    $('#print_senderName').text($('#senderName').text());
    $('#print_senderNationality').text($('#senderNationality').text());
    $('#print_senderMobile').text($('#senderMobile').text());
    $('#print_senderGender').text($('#senderGender').text());
    $('#print_senderAddress').text($('#senderAddress').text());

    // 수취인 정보
    $('#print_beneficiaryName').text($('#beneficiaryName').text());
    $('#print_beneficiaryNationality').text($('#beneficiaryNationality').text());
    $('#print_beneficiaryPhone').text($('#beneficiaryPhone').text());
    $('#print_beneficiaryGender').text($('#beneficiaryGender').text());
    $('#print_beneficiaryAddress').text($('#beneficiaryAddress').text());
    $('#print_beneficiaryPayoutBankName').text($('#beneficiaryPayoutBankName').text());
    $('#print_beneficiaryAC').text($('#beneficiaryAC').text());

    // 거래 정보
    $('#print_pinNo').text(partnerId);
    $('#print_transactionId').text($('#transactionId').text());
    $('#print_transactionDate').html(dateText);
    $('#print_collectedAmount').text($('#collectedAmount').text());
    $('#print_receiveAmount').text($('#receiveAmount').text());
    $('#print_serviceCharge').text($('#serviceCharge').text());
    $('#print_transferAmount').text($('#transferAmount').text());
    $('#print_customerRate').text($('#customerRate').text());

    const depositType = $('#depositType').text() || $('#depositTypeSelect').val();
    $('#print_depositType').text(depositType);
    const depositMethod = $('#depositMethod').text() || $('#depositMethodSelect').val();
    $('#print_depositMethod').text(depositMethod);
    $('#print_purposeOfRemittance').text($('#purposeOfRemittance').text());
    $('#print_sourceOfIncome').text($('#sourceOfIncome').text());
    $('#print_RelToBeneficiary').text($('#RelToBeneficiary').text());
    $('#print_paymentType').text($('#paymentType').text());
    $('#print_beneficiaryPayoutBranchName').text($('#beneficiaryPayoutBranchName').text());
}

const transactionPrintContent = (printArea) => {
    return (
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Transaction Receive Slip</title>
            <style>${transactionPrintStyles}</style>
        </head>
        <body>
        	<div id="printArea">
        	${printArea}
			</div>
            <script>
                window.onload = function() {
                    const mediaQueryList = window.matchMedia('print');
                    mediaQueryList.addListener(function(mql) {
                        if (!mql.matches) {
                            window.close();
                        }
                    });
                    
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                }
            </script>
        </body>
        </html>
    	`
    )
}

const transactionPrintStyles = `
    @page {
        size: A5 landscape;
        margin: 2mm 5mm;
    }
    @media print {
        body * { visibility: hidden; }
        #printArea, #printArea * { visibility: visible; }
        #printArea {
            width: 210mm; 
            height: 140mm;  
         }
        .modal-footer, .modal-header { display: none !important; }
    }
    
    #print_pinNo_title,
    #print_pinNo {
        font-size: 16pt;
    }
    #printOptionsModal .print-preview,
     #printArea .print-preview {
        padding: 0px;
        font-family: Arial, sans-serif;
        font-size: 11pt;
    }
    #printOptionsModal .print-table, 
     #printArea .print-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0px;
        font-size: 10pt;
    }
    #printOptionsModal .print-table th, 
    #printOptionsModal .print-table td,
    #printArea .print-table th,
    #printArea .print-table td {
        border: 1px solid #ddd;
        padding: 5px 5px;
        text-align: left;
    }
    #printOptionsModal .print-table th,
     #printArea .print-table th {
        width: 35%;
    }
    #printOptionsModal .print-header,
     #printArea .print-header {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 3px;
        justify-content: space-between;
    }
    #printOptionsModal .print-header img,
     #printArea .print-header img {
        width: 80px;
        height: auto;
        margin-right: 0px;
    }
    #printOptionsModal .print-header span,
     #printArea .print-header span{
        margin: 0;
        color: #333;
        font-size: 8pt;
    }
    #printOptionsModal .print-header-content,
     #printArea .print-header-content {
        display: flex;
        gap: 5px;
    }
    #printOptionsModal .print-header-content span,
     #printArea .print-header-content span {
        display: block;
    }
    #printOptionsModal .row,
     #printArea .row {
        display: flex;
        gap: 10px;
    }
    #printOptionsModal .col,
     #printArea .col {
        flex: 1;
    }
    #printOptionsModal .centered,
     #printArea .centered {
        display: flex;
        flex-direction: column;
        justify-content: center; 
        align-items: center;        
        font-size: 14pt;
    }
    #printOptionsModal .print-section,
     #printArea .print-section {
        margin-bottom: 12px;
    }
    #printOptionsModal .print-section-title,
     #printArea .print-section-title {
        margin: 5px 0 10px;
        color: #333;
        font-size: 12pt;
        font-weight: bold;
    }
`;

const pgReportStyles = `
    table {
        font-size: 10pt; !important;
        border-collapse: collapse; !important;
        width: 100%; !important;
        height: 60%; !important;
    }

    table th,
    table td {
        font-size: 10pt; !important;
        padding: 0px; !important; 
        margin: 0px; !important;
        word-break: break-word; !important;
    }
    
    .print-table {
        width: 100%; !important;
        border-collapse: collapse; !important;
        margin-bottom: 15px; !important;
        font-size: 10pt; !important;
    }
    .print-table th, .print-table td {
        border: 1px solid #ddd; !important;
        padding: 5px 8px; !important;
        text-align: left; !important;
    }
    .print-table th {
        height: 60%; !important;
    }

    @media print {
        .a4 {
            margin: 0;
            box-shadow: none;
        }
    }
`;

