// app/generate/wizardSchema.ts

export type QuestionType = "text" | "textarea" | "select" | "number" | "multi-select";

export type QuestionId =
    | "product"
    | "targetCustomer"
    | "problem"
    | "uniqueness"
    | "workFormat"
    | "team"
    | "pricing"
    | "monthlyCosts"
    | "expectedRevenue"
    | "planPurpose"
    | "startupInvestment"
    | "growthPlan"
    | "budget"
    | "creditAmount";

export interface QuestionConfig {
    id: QuestionId;
    label: string;
    placeholder?: string;
    helperText?: string;
    type: QuestionType;
    required?: boolean;
    options?: string[];   // для select / multi-select
    allowOther?: boolean; // для multi-select з “Інше”
}

export type WizardAnswers = Partial<Record<QuestionId, string | string[]>>;


export interface WizardStep {
    id: string;
    title: string;
    description?: string;
    questions: QuestionConfig[];
}

export const WIZARD_STEPS: WizardStep[] = [
    {
        id: "about-business",
        title: "Про ваш бізнес",
        description: "Коротко опишіть, що ви плануєте запустити.",
        questions: [
            {
                id: "product",
                type: "textarea",
                label: "Що саме ви продаєте або плануєте продавати?",
                placeholder:
                    "Наприклад: кавʼярня з десертами та кавою на виніс / онлайн-магазин одягу / салон краси з акцентом на брови та вії.",
                helperText: "Опишіть продукт або послугу простою мовою.",
                required: true,
            },
            {
                id: "workFormat",
                type: "select",
                label: "У якому форматі ви працюєте?",
                options: [
                    "Офлайн локація (кафе, салон, магазин)",
                    "Послуги на виїзді до клієнта",
                    "Онлайн (курси, консалтинг, e-commerce)",
                    "Змішаний формат",
                ],
                placeholder: "Оберіть варіант, який найбільше підходить.",
                required: true,
            },
        ],
    },
    {
        id: "clients-and-value",
        title: "Клієнти та цінність",
        description: "Кому ви продаєте та яку потребу закриваєте.",
        questions: [
            {
                id: "targetCustomer",
                type: "textarea",
                label: "Хто ваш головний клієнт?",
                placeholder:
                    "Наприклад: молоді люди 20–35 років, що працюють в офісі поблизу; мами з дітьми; туристи; малі підприємці, які запускають онлайн-бізнес.",
                helperText:
                    "Опишіть типових клієнтів: вік, стиль життя, чим займаються.",
                required: true,
            },
            {
                id: "problem",
                type: "textarea",
                label: "Яку проблему або потребу вирішує ваш бізнес?",
                placeholder:
                    "Наприклад: немає затишного місця для кави поблизу офісів; людям потрібен швидкий і недорогий манікюр; підприємцям складно самостійно зробити бізнес-план.",
                helperText:
                    "Чому люди взагалі мають прийти до вас, а не жити без цього продукту?",
                required: true,
            },
            {
                id: "uniqueness",
                type: "textarea",
                label: "Чим ви відрізняєтесь від конкурентів?",
                placeholder:
                    "Наприклад: локація в центрі; затишний інтерʼєр; краща якість продукту; швидке обслуговування; доступні ціни; вузька спеціалізація.",
                helperText:
                    "Це допоможе сформувати розділ про конкурентні переваги у бізнес-плані.",
                required: true,
            },
        ],
    },
    {
        id: "team-and-finance",
        title: "Команда та фінанси",
        description: "Скільки людей залучено та які базові цифри.",
        questions: [
            {
                id: "team",
                type: "select",
                label: "Хто буде працювати в бізнесі?",
                options: [
                    "Тільки я",
                    "Я + 1 працівник",
                    "Невелика команда (2–5 людей)",
                    "Більша команда (6+ людей)",
                    "Переважно підрядники / фріланс",
                ],
                placeholder: "Оберіть варіант.",
                required: true,
            },
            {
                id: "pricing",
                type: "textarea",
                label: "Які будуть основні ціни на ваші послуги/товари?",
                placeholder:
                    "Наприклад: середній чек у кавʼярні — 120 грн; стрижка — 350 грн; онлайн-курс — 2500 грн; середнє замовлення в інтернет-магазині — 800 грн.",
                helperText:
                    "Можна написати діапазон або кілька прикладів. Сервіс використає це для розрахунків.",
                required: true,
            },
            {
                id: "monthlyCosts",
                type: "multi-select",
                label: "На що у вас будуть основні щомісячні витрати?",
                options: [
                    "Оренда приміщення",
                    "Зарплата працівників",
                    "Закупівля товару / сировини",
                    "Реклама та маркетинг",
                    "Комунальні послуги",
                    "Податки та бухгалтерія",
                    "Обслуговування обладнання",
                    "Онлайн-сервіси та програмне забезпечення",
                    "Логістика / доставка",
                    "Кредити / лізинг / відсотки банку",
                ],
                allowOther: true,
                helperText:
                    "Обберіть усе, що підходить. За потреби допишіть свої витрати в полі “Інше”.",
            },
            {
                id: "expectedRevenue",
                type: "number",
                label: "Яку орієнтовну суму продажів ви очікуєте на місяць?",
                placeholder: "Наприклад: 80 000 грн / 200 000 грн / 500 000 грн.",
                helperText:
                    "Це допоможе згенерувати базову фінансову модель (дохід, прибуток).",
            },
        ],
    },
    {
        id: "purpose-and-growth",
        title: "Мета бізнес-плану та розвиток",
        description: "Для чого вам потрібен бізнес-план і куди ви рухаєтесь.",
        questions: [
            {
                id: "planPurpose",
                type: "select",
                label: "Для чого вам потрібен готовий бізнес-план?",
                options: [
                    "Подати в банк",
                    "Подати на грантову програму",
                    "Для інвестора",
                    "Для себе (структурувати ідею)",
                    "Інше",
                ],
                placeholder: "Оберіть головну ціль.",
                required: true,
            },
            {
                id: "startupInvestment",
                type: "number",
                label: "Скільки коштів приблизно потрібно для запуску?",
                placeholder: "Наприклад: 100 000 грн / 10 000$ / 250 000 грн.",
                helperText:
                    "Можна приблизно. Ці дані підуть у розділ про інвестиційні потреби.",
            },
            {
                id: "growthPlan",
                type: "textarea",
                label: "Які ваші плани на розвиток бізнесу на 6–12 місяців?",
                placeholder:
                    "Наприклад: вийти в плюс за 6 місяців; відкрити другу точку; збільшити кількість клієнтів у 2 рази; запустити онлайн-продажі.",
                helperText:
                    "Це ляже в розділ про стратегію розвитку та цілі бізнесу.",
            },
            {
                id: "budget",
                type: "number",
                label: "Який бюджет ви плануєте виділити на запуск бізнесу?",
                placeholder: "Наприклад: 150 000 грн / 5 000$",
                helperText:
                    "Це допоможе розрахувати інвестиційну частину бізнес-плану.",
                required: false,
            },
            {
                id: "creditAmount",
                type: "number",
                label: "Чи плануєте брати кредит? Якщо так — яку суму?",
                placeholder: "Наприклад: 80 000 грн або залиште порожнім",
                helperText:
                    "Ця інформація буде включена в розділ про джерела фінансування.",
                required: false,
            },
        ],
    },
];
