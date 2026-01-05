document.addEventListener('DOMContentLoaded', function () {
    // 1. 모바일 메뉴
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
        });
    } else if (mobileMenuButton) {
        // 모바일 메뉴 엘리먼트가 없는 경우를 위한 폴백
        mobileMenuButton.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // 2. 언어 선택
    const langSelector = document.getElementById('language-selector');
    const langOptions = document.getElementById('language-options');

    console.log('Language selector found:', langSelector);
    console.log('Language options found:', langOptions);

    if (langSelector && langOptions) {
        langSelector.addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('Language selector clicked!');
            langOptions.classList.toggle('hidden');
            const isExpanded = !langOptions.classList.contains('hidden');
            langSelector.setAttribute('aria-expanded', isExpanded);
            console.log('Language options visible:', isExpanded);
        });

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', function () {
            if (langOptions && !langOptions.classList.contains('hidden')) {
                langOptions.classList.add('hidden');
                langSelector.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        console.error('Language selector or options not found!');
    }

    // 3. 배경 슬라이더
    const slider = document.getElementById('background-slider');
    if (slider) {
        const slides = slider.querySelectorAll('.absolute.transition-opacity');
        let currentSlide = 0;

        if (slides.length > 0) {
            setInterval(() => {
                slides[currentSlide].style.opacity = '0';
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].style.opacity = '1';
            }, 5000); // 5초마다 전환
        }
    }

    // 4. Rate Calculator
    const priceInput = document.getElementById('price');
    const sendingRadio = document.getElementById('sending');
    const receivingRadio = document.getElementById('receiving');
    const resultDiv = document.getElementById('calculation-result');

    if (priceInput && resultDiv) {
        const MIN_AMOUNT = 5000;
        const SERVICE_CHARGE = 1500; // 수수료 KRW 1,500
        let EXCHANGE_RATE = null;

        // 현재 선택된 국가
        let selectedFromCountry = 'KOR';
        let selectedToCountry = 'ARE';

        // 국가 코드 → 통화 코드 매핑
        const countryToCurrency = {
            'ARE': 'AED', 'AUS': 'AUD', 'BGD': 'BDT', 'JPN': 'JPY',
            'IND': 'INR', 'KOR': 'KRW', 'NPL': 'NPR', 'PHL': 'PHP',
            'THA': 'THB', 'VNM': 'VND'
        };

        // 국가 이름 매핑
        const countryNames = {
            'ARE': 'UAE', 'AUS': 'Australia', 'BGD': 'Bangladesh', 'JPN': 'Japan',
            'IND': 'India', 'KOR': 'Korea', 'NPL': 'Nepal', 'PHL': 'Philippines',
            'THA': 'Thailand', 'VNM': 'Vietnam'
        };

        // 드롭다운 요소
        const sendingButton = document.getElementById('sending-from');
        const sendingOptions = document.getElementById('sending-from-options');
        const receivingButton = document.getElementById('receiving-to');
        const receivingOptions = document.getElementById('receiving-to-options');

        // 드롭다운 토글
        if (sendingButton && sendingOptions) {
            sendingButton.addEventListener('click', function (e) {
                e.stopPropagation();
                sendingOptions.classList.toggle('hidden');
                receivingOptions?.classList.add('hidden');
            });

            // "Sending from" 국가 선택
            sendingOptions.querySelectorAll('[role="option"]').forEach(option => {
                option.addEventListener('click', function () {
                    const country = this.getAttribute('data-country');
                    selectedFromCountry = country;

                    // 버튼 텍스트 업데이트
                    const imgSrc = this.querySelector('img').src;
                    const countryName = countryNames[country];
                    sendingButton.querySelector('.flex').innerHTML =
                        `<img src="${imgSrc}" class="w-4 h-4 mr-2 rounded-sm shadow" alt="">${countryName}`;

                    sendingOptions.classList.add('hidden');
                    console.log('✈️ 송금 국가:', country);
                    fetchExchangeRate();
                });
            });
        }

        if (receivingButton && receivingOptions) {
            receivingButton.addEventListener('click', function (e) {
                e.stopPropagation();
                receivingOptions.classList.toggle('hidden');
                sendingOptions?.classList.add('hidden');
            });

            // "Receiving to" 국가 선택
            receivingOptions.querySelectorAll('[role="option"]').forEach(option => {
                option.addEventListener('click', function () {
                    const country = this.getAttribute('data-country');
                    selectedToCountry = country;

                    // 버튼 텍스트 업데이트
                    const imgSrc = this.querySelector('img').src;
                    const countryName = countryNames[country];
                    receivingButton.querySelector('.flex').innerHTML =
                        `<img src="${imgSrc}" class="w-4 h-4 mr-2 rounded-sm shadow" alt="">${countryName}`;

                    receivingOptions.classList.add('hidden');
                    console.log('📍 수취 국가:', country);
                    fetchExchangeRate();
                });
            });
        }

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', function () {
            sendingOptions?.classList.add('hidden');
            receivingOptions?.classList.add('hidden');
        });

        // 환율 API 호출
        async function fetchExchangeRate() {
            const fromCurrency = countryToCurrency[selectedFromCountry];
            const toCurrency = countryToCurrency[selectedToCountry];

            try {
                const response = await fetch(`/api/exchange-rate?from=${fromCurrency}&to=${toCurrency}`);
                const data = await response.json();

                if (data.success && data.rate > 0) {
                    EXCHANGE_RATE = data.rate;
                    console.log(`💱 ${fromCurrency} → ${toCurrency} = ${EXCHANGE_RATE}`);
                    calculateRemittance();
                } else {
                    console.error('환율 조회 실패:', data.error);
                    alert('환율 정보를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.');
                }
            } catch (error) {
                console.error('환율 조회 실패:', error);
                alert('서버와 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
            }
        }

        function calculateRemittance() {
            const amount = parseFloat(priceInput.value) || 0;

            if (!EXCHANGE_RATE || amount === 0) {
                resultDiv.classList.add('hidden');
                return;
            }

            resultDiv.classList.remove('hidden');

            const isSending = sendingRadio.checked;
            const sendingAmount = isSending ? amount : amount / EXCHANGE_RATE;
            const isValid = sendingAmount >= MIN_AMOUNT;

            let amountAfterFee = sendingAmount;
            let totalAmountWithFee = sendingAmount;
            if (isValid) {
                totalAmountWithFee = sendingAmount + SERVICE_CHARGE;
                amountAfterFee = sendingAmount;
            }
            const receivingAmount = isSending ? amountAfterFee * EXCHANGE_RATE : amount;

            const fromCurrency = countryToCurrency[selectedFromCountry] || 'KRW';
            const toCurrency = countryToCurrency[selectedToCountry] || 'AED';
            const fromCountryName = countryNames[selectedFromCountry] || 'Korea';
            const toCountryName = countryNames[selectedToCountry] || 'UAE';

            // 1단계: 송금액 (수수료 포함)
            const sendStep = document.querySelector('[data-step="send"]');
            if (sendStep) {
                const displayAmount = isValid ? totalAmountWithFee : sendingAmount;
                sendStep.innerHTML =
                    `You send <span class="font-medium text-blue-700">${fromCurrency} ${Math.round(displayAmount).toLocaleString()}</span> from ${fromCountryName}`;
            }

            // 2단계: 경고 메시지
            const warningContainer = document.querySelector('[data-step="warning-container"]');
            const warningStep = document.querySelector('[data-step="warning"]');
            if (warningContainer && warningStep) {
                if (!isValid) {
                    warningContainer.classList.remove('hidden');
                    warningStep.textContent =
                        `Sending amount is less than minimum amount (${fromCurrency} ${MIN_AMOUNT.toLocaleString()}) allowed per transaction.`;
                } else {
                    warningContainer.classList.add('hidden');
                }
            }

            // 3단계: 수수료
            const serviceChargeContainer = document.querySelector('[data-step="service-charge-container"]');
            const serviceChargeStep = document.querySelector('[data-step="service-charge"]');
            if (serviceChargeContainer && serviceChargeStep) {
                if (isValid) {
                    serviceChargeContainer.classList.remove('hidden');
                    serviceChargeStep.textContent =
                        `${fromCurrency} ${SERVICE_CHARGE.toLocaleString()} service charge added`;
                } else {
                    serviceChargeContainer.classList.add('hidden');
                }
            }

            // 4단계: 환율
            const rateStep = document.querySelector('[data-step="rate"]');
            if (rateStep) {
                rateStep.textContent =
                    `@ rate of ${fromCurrency} 1 = ${toCurrency} ${EXCHANGE_RATE.toFixed(8)}`;
            }

            // 5단계: 수취액
            const receiveStep = document.querySelector('[data-step="receive"]');
            if (receiveStep) {
                receiveStep.innerHTML =
                    `<span class="font-medium text-blue-700">${toCurrency} ${Math.round(receivingAmount).toLocaleString()}</span> is received at ${toCountryName}`;
            }
        }

        // 이벤트 리스너
        priceInput.addEventListener('input', calculateRemittance);
        if (sendingRadio) sendingRadio.addEventListener('change', calculateRemittance);
        if (receivingRadio) receivingRadio.addEventListener('change', calculateRemittance);

        // 초기 환율 조회
        fetchExchangeRate();
        resultDiv.classList.add('hidden');
    }

    // 5. Exchange Rate List
    const exchangeRateList = document.getElementById('exchange-rate-list');
    const exchangeRateUpdated = document.getElementById('exchange-rate-updated');

    if (exchangeRateList && exchangeRateUpdated) {
        // 지원하는 국가 목록
        const supportedCountries = [
            {code: 'AUS', name: 'Australia', currency: 'AUD'},
            {code: 'BGD', name: 'Bangladesh', currency: 'BDT'},
            {code: 'BRA', name: 'Brazil', currency: 'BRL'},
            {code: 'KHM', name: 'Cambodia', currency: 'KHR'},
            {code: 'EGY', name: 'Egypt', currency: 'EGP'},
            {code: 'GHA', name: 'Ghana', currency: 'GHS'},
            {code: 'IND', name: 'India', currency: 'INR'},
            {code: 'IDN', name: 'Indonesia', currency: 'IDR'},
            {code: 'JPN', name: 'Japan', currency: 'JPY'},
            {code: 'MYS', name: 'Malaysia', currency: 'MYR'},
            {code: 'MNG', name: 'Mongolia', currency: 'MNT'},
            {code: 'NPL', name: 'Nepal', currency: 'NPR'},
            {code: 'PAK', name: 'Pakistan', currency: 'PKR'},
            {code: 'PHL', name: 'Philippines', currency: 'PHP'},
            {code: 'SGP', name: 'Singapore', currency: 'SGD'},
            {code: 'KOR', name: 'South Korea', currency: 'KRW'},
            {code: 'LKA', name: 'Sri Lanka', currency: 'LKR'},
            {code: 'THA', name: 'Thailand', currency: 'THB'},
            {code: 'TUR', name: 'Turkey', currency: 'TRY'},
            {code: 'ARE', name: 'UAE', currency: 'AED'},
            {code: 'GBR', name: 'UK', currency: 'GBP'},
            {code: 'UGA', name: 'Uganda', currency: 'UGX'},
            {code: 'VNM', name: 'Viet Nam', currency: 'VND'}
        ];

        // 환율 리스트 로드
        async function fetchAllExchangeRates() {
            try {
                const rates = [];

                // 모든 국가의 환율을 가져오기
                for (const country of supportedCountries) {
                    if (country.currency === 'KRW') continue; // KRW는 제외

                    try {
                        const response = await fetch(`/api/exchange-rate?from=KRW&to=${country.currency}`);
                        const data = await response.json();

                        if (data.success && data.rate > 0) {
                            rates.push({
                                code: country.code,
                                name: country.name,
                                currency: country.currency,
                                rate: data.rate
                            });
                        }
                    } catch (error) {
                        console.error(`Failed to fetch rate for ${country.currency}:`, error);
                    }
                }

                return rates;
            } catch (error) {
                console.error('환율 리스트 로드 실패:', error);
                return [];
            }
        }

        // 환율 리스트 렌더링
        function renderExchangeRateList(rates) {
            if (rates.length === 0) {
                exchangeRateList.innerHTML = `
                    <li class="px-4 py-3 text-center text-gray-400">
                        No exchange rates available
                    </li>
                `;
                return;
            }

            exchangeRateList.innerHTML = rates.map(rate => `
                <li class="px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <div class="flex items-center">
                        <img src="/flags/${rate.code.toLowerCase()}.svg" 
                             class="w-4 h-4 mr-3 rounded-sm shadow" 
                             alt="${rate.name}">
                        <span class="text-sm text-gray-600">${rate.name}</span>
                    </div>
                    <span class="text-sm font-mono text-gray-600">
                        ${rate.rate.toFixed(rate.rate < 1 ? 9 : 6)} 
                        <span class="text-gray-500 text-xs">${rate.currency}</span>
                    </span>
                </li>
            `).join('');

            const loadingIndicator = document.getElementById('exchange-rate-loading');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }

        // 업데이트 시간 포맷팅
        function formatUpdateTime() {
            const now = new Date();
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            };

            return now.toLocaleString('en-US', options);
        }

        // 환율 리스트 초기화
        async function initializeExchangeRateList() {
            const rates = await fetchAllExchangeRates();
            renderExchangeRateList(rates);
            exchangeRateUpdated.textContent = `Last updated on: ${formatUpdateTime()}`;
        }

        // 페이지 로드 시 환율 리스트 로드
        initializeExchangeRateList();

        // 5분마다 환율 리스트 업데이트
        setInterval(initializeExchangeRateList, 5 * 60 * 1000);
    }
});

