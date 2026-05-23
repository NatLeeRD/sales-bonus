/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
        //Возвращает выручку, рассчитанную по такой формуле: sale_price × количество проданных товаров quantity × константа discount.
        // purchase — это одна из записей в поле items из чека в data.purchase_records
        // _product — это продукт из коллекции data.products

        // @TODO: Расчет выручки от операции

       //деструктурируем  объекты и  задаем константы для discount, sale_price и quantity
        const { discount, sale_price, quantity } = purchase;
        // Записываеv в константу discount коэффициент для расчета суммы без скидки в десятичном формате. Рассчитаем коэффициент по формуле:   1 - (purchase.discount / 100)
        const discountCoefficient = 1 - (discount / 100);
        //считаем выручку по формуле с четом заменя константы discount на коэффициент скидки
        const revenue = sale_price * quantity * discountCoefficient;

        return revenue;
}

/*const testPurchase = {
    discount: 10,
    quantity: 3,
    sale_price: 500
};

console.log(calculateSimpleRevenue(testPurchase));*/

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {

// @TODO: Расчет бонуса от позиции в рейтинге

        const { profit } = seller;

        // добавьте код, который реализует условия расчёта, которые указаны в требованиях к задаче. Понять, что продавец на последнем месте, можно так: сравните index c total - 1, то есть с последним индексом в массиве, длина которого равна total.
    if (index === 0) {
        return profit * 0.15; // 15% — для продавца, который принёс наибольшую прибыль (1st place = id 0 in array)
    } else if (index === 1 || index === 2) {
        return profit * 0.10; // 10% — для продавцов, которые оказались на втором и третьем месте по прибыли
    } else if (index === total - 1) {
        return 0; // 0% — для продавца, который оказался на последнем месте
    } else {
        return profit * 0.05; // 5% — для всех остальных продавцов, кроме последнего
    }
        }

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {

    // @TODO: Проверка входных данных

    if (
        !data ||
        !Array.isArray(data.sellers) ||
        !Array.isArray(data.products) ||
        !Array.isArray(data.purchase_records) ||
        data.sellers.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    }
        
    // @TODO: Проверка наличия опций
        if (!options) {
            throw new Error('Не переданы опции');
        }
        
        const { calculateRevenue, calculateBonus } = options;

        if (
            typeof calculateRevenue === 'function' ||
            typeof calculateBonus === 'function'
        ) {
            console.log('is function');
        }

        if (
            typeof calculateRevenue !== 'function' ||
            typeof calculateBonus !== 'function'
        ) {
            throw new Error('Функции расчёта отсутствуют');
        }

        // @TODO: Подготовка промежуточных данных для сбора статистики

        const sellerStats = data.sellers.map(seller => ({
            // Заполним начальными данными -- Выполните маппинг по коллекции продавцов
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        }));


// @TODO: Индексация продавцов и товаров для быстрого доступа
        // Преобразуйте продавцов и товары в объекты, Для более быстрого доступа введите индексы
    const sellerIndex = Object.fromEntries(
        sellerStats.map(seller => [seller.id, seller])
    );

    const productIndex = Object.fromEntries(
        data.products.map(product => [product.sku, product])
    );


// @TODO: Расчет выручки и прибыли для каждого продавца
        // Переберите все записи о продажах.
        //Обновите статистику в объекте для каждого продавца (запись из sellerStats).

        data.purchase_records.forEach(record => {

        // продавец
        const seller = sellerIndex[record.seller_id];

        // количество продаж (чеков)
        seller.sales_count += 1;

        // сумма чека
        let receiptRevenue = 0;

        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {

            // товар
            const product = productIndex[item.sku];

            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            const revenue =
                calculateRevenue(item, product);

            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            const cost =
                product.purchase_price *
                item.quantity;

            // Посчитать прибыль: выручка минус себестоимость
            const profit =
                revenue - cost;

            // накапливаем выручку
            receiptRevenue += revenue;

            // Увеличить общую накопленную прибыль (profit) у продавца 
            seller.profit += profit;

            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            // По артикулу товара увеличить его проданное количество у продавца
            seller.products_sold[item.sku] +=
                item.quantity;
        });

        // общая выручка продавца
        seller.revenue += receiptRevenue;
    });

// @TODO: Сортировка продавцов по прибыли

        // Отсортируйте продавцов по убыванию: продавец с самой высокой прибылью (profit) должен иметь индекс 0 и стоять первым в массиве.

        sellerStats.sort(
            (a, b) => b.profit - a.profit
        );

// @TODO: Назначение премий на основе ранжирования

// перебрать отсортированный массив sellerStats. Затем сделайте следующее для каждого продавца: Посчитайте бонус, используя функцию calculateBonus
    sellerStats.forEach((seller, index) => {

        // Считаем бонус
        seller.bonus =
            calculateBonus(
                index,
                sellerStats.length,
                seller
            );

        // Формируем топ-10 товаров
        //код, который преобразует объект с проданными товарами в массив из 10 самых продаваемых товаров. Для этого полю seller.top_products нужно присвоить выражение.
        seller.top_products =
        //Преобразовать seller.products_sold из объекта вида {[sku]: quantity} в массив вида [[sku, quantity], …] с помощью функции Object.entries().  Для удобства работы трансформируйте массив вида [[key, value]] в [{sku, quantity}], используя функцию .map().
            Object.entries(seller.products_sold)

                .map(([sku, quantity]) => ({
                    sku,
                    quantity
                }))
        // Отсортируйте массив по убыванию количества товаров quantity.
                .sort(
                    (a, b) =>
                        b.quantity - a.quantity
                )
        // Отделите от массива первые 10 элементов, используя .slice().
                .slice(0, 10);
    });

// @TODO: Подготовка итоговой коллекции с нужными полями

        // Сформируйте итоговый отчёт и верните его из функции. Для этого снова примените маппинг к массиву sellerStats
        //.toFixed(2) преобразует число в строку, содержащую число с двумя знаками после точки;
        //+ приводит значение снова к числу.
        
        return sellerStats.map(seller => ({
            seller_id: seller.id, // Строка, идентификатор продавца
            name: seller.name, // Строка, имя продавца
            revenue: +seller.revenue.toFixed(2), // Число с двумя знаками после точки, выручка продавца
            profit: +seller.profit.toFixed(2), // Число с двумя знаками после точки, прибыль продавца
            sales_count: seller.sales_count, // Целое число, количество продаж продавца
            top_products: seller.top_products,  // Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
            bonus: +seller.bonus.toFixed(2) // Число с двумя знаками после точки, бонус продавца
        }));
}
