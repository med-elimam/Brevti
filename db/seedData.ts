export interface SeedSubject {
  name: string;
  color: string;
}

export interface SeedLesson {
  subject_name: string;
  title: string;
  summary: string;
  importance_points: string;
  common_mistakes: string;
}

export interface SeedExercise {
  lesson_title: string;
  difficulty: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export function getSeedData() {
  const subjects: SeedSubject[] = [
    { name: 'الرياضيات', color: '#3498DB' },
    { name: 'اللغة العربية', color: '#27AE60' },
    { name: 'اللغة الفرنسية', color: '#9B59B6' },
    { name: 'العلوم الطبيعية', color: '#E67E22' },
    { name: 'التاريخ والجغرافيا', color: '#E74C3C' },
  ];

  const lessons: SeedLesson[] = [
    // Math lessons
    {
      subject_name: 'الرياضيات',
      title: 'المعادلات من الدرجة الأولى',
      summary: 'تعلم كيفية حل المعادلات البسيطة من الدرجة الأولى بمجهول واحد. يشمل نقل الحدود وتبسيط المعادلات.',
      importance_points: 'أساس حل المسائل الجبرية. يظهر في معظم تمارين الرياضيات. مهم لفهم الدوال.',
      common_mistakes: 'نسيان تغيير الإشارة عند النقل. عدم التحقق من الحل. الخلط بين الضرب والقسمة.',
    },
    {
      subject_name: 'الرياضيات',
      title: 'نظرية فيثاغورس',
      summary: 'في المثلث القائم، مربع الوتر يساوي مجموع مربعي الضلعين القائمين. a² + b² = c²',
      importance_points: 'أساسية لحساب المسافات. تستخدم في الهندسة والفيزياء. تظهر في كل امتحان تقريباً.',
      common_mistakes: 'الخلط بين الوتر والأضلاع الأخرى. نسيان أخذ الجذر التربيعي. عدم التحقق من قائمية المثلث.',
    },
    {
      subject_name: 'الرياضيات',
      title: 'الكسور والعمليات عليها',
      summary: 'الجمع والطرح والضرب والقسمة على الكسور. توحيد المقامات وتبسيط الكسور.',
      importance_points: 'أساس الحساب. يظهر في النسب المئوية. مهم للمسائل التطبيقية.',
      common_mistakes: 'عدم توحيد المقامات قبل الجمع. الخلط في قلب الكسر عند القسمة. نسيان التبسيط.',
    },
    {
      subject_name: 'الرياضيات',
      title: 'حساب المساحات والمحيطات',
      summary: 'حساب مساحات ومحيطات الأشكال الهندسية الأساسية: المربع، المستطيل، المثلث، الدائرة.',
      importance_points: 'تطبيقات عملية كثيرة. أساس الهندسة الفراغية. يظهر في مسائل الحياة اليومية.',
      common_mistakes: 'الخلط بين المساحة والمحيط. نسيان وحدة القياس. أخطاء في حساب π.',
    },
    {
      subject_name: 'الرياضيات',
      title: 'النسب والتناسب',
      summary: 'فهم العلاقة بين كميتين متناسبتين. حل مسائل التناسب الطردي والعكسي.',
      importance_points: 'أساس حل مسائل الحياة العملية. مهم للخرائط والمقاييس. يرتبط بالنسب المئوية.',
      common_mistakes: 'الخلط بين التناسب الطردي والعكسي. أخطاء في ضرب المتقاطعات. عدم فهم السياق.',
    },
    // Arabic lessons
    {
      subject_name: 'اللغة العربية',
      title: 'أنواع الجمل',
      summary: 'الجملة الاسمية والفعلية. المبتدأ والخبر. الفعل والفاعل والمفعول به.',
      importance_points: 'أساس فهم التراكيب النحوية. ضروري للإعراب الصحيح. يظهر في كل نص.',
      common_mistakes: 'الخلط بين الجملة الاسمية والفعلية. أخطاء في تحديد المبتدأ. نسيان المفعول به.',
    },
    {
      subject_name: 'اللغة العربية',
      title: 'علامات الإعراب',
      summary: 'الضمة للرفع، الفتحة للنصب، الكسرة للجر. الإعراب بالحركات والحروف.',
      importance_points: 'ضروري للكتابة الصحيحة. يؤثر على المعنى. أساس النحو العربي.',
      common_mistakes: 'الخلط بين الحركات. عدم معرفة الأسماء الخمسة. أخطاء في المثنى والجمع.',
    },
    {
      subject_name: 'اللغة العربية',
      title: 'الفعل الماضي والمضارع والأمر',
      summary: 'تصريف الأفعال في الأزمنة المختلفة. علامات كل زمن وكيفية تحويل الفعل.',
      importance_points: 'أساس فهم النصوص. مهم للتعبير الكتابي. يظهر في الإملاء.',
      common_mistakes: 'أخطاء في التصريف. نسيان همزة الوصل والقطع. الخلط بين المضارع والأمر.',
    },
    {
      subject_name: 'اللغة العربية',
      title: 'المفعول المطلق',
      summary: 'اسم منصوب يأتي بعد فعل من لفظه لتأكيده أو بيان نوعه أو عدده.',
      importance_points: 'يحسن الأسلوب. مهم في التعبير. يظهر في الإعراب.',
      common_mistakes: 'الخلط مع المفعول به. عدم معرفة أنواعه. أخطاء في النصب.',
    },
    {
      subject_name: 'اللغة العربية',
      title: 'البلاغة - التشبيه والاستعارة',
      summary: 'أركان التشبيه الأربعة. أنواع الاستعارة: تصريحية ومكنية. جمالية الصور البلاغية.',
      importance_points: 'مهم لفهم النصوص الأدبية. يظهر في أسئلة البلاغة. يحسن التعبير الكتابي.',
      common_mistakes: 'الخلط بين التشبيه والاستعارة. عدم تحديد الأركان. نسيان أثر الصورة.',
    },
    // French lessons
    {
      subject_name: 'اللغة الفرنسية',
      title: 'Les temps verbaux',
      summary: 'تصريف الأفعال في الأزمنة المختلفة: الماضي والحاضر والمستقبل. أهم الأفعال المساعدة.',
      importance_points: 'أساس الكتابة والقراءة. يظهر في كل تمرين. ضروري للفهم.',
      common_mistakes: 'أخطاء في تصريف être و avoir. الخلط بين الأزمنة. نسيان التطابق.',
    },
    {
      subject_name: 'اللغة الفرنسية',
      title: 'Les pronoms personnels',
      summary: 'ضمائر الفاعل والمفعول به المباشر وغير المباشر. موقعها في الجملة.',
      importance_points: 'تجنب التكرار في النص. مهم للفهم. يظهر في التعبير.',
      common_mistakes: 'الخلط بين le/la/les و lui/leur. موقع الضمير الخاطئ. نسيان التطابق.',
    },
    {
      subject_name: 'اللغة الفرنسية',
      title: 'La phrase interrogative',
      summary: 'طرق طرح السؤال بالفرنسية. استخدام أدوات الاستفهام المختلفة.',
      importance_points: 'مهم للحوار. يظهر في فهم المقروء. أساس التواصل.',
      common_mistakes: 'الخلط بين qui/que/quoi. نسيان قلب الفعل. أخطاء في التنغيم.',
    },
    {
      subject_name: 'اللغة الفرنسية',
      title: 'Les adjectifs',
      summary: 'تطابق الصفة مع الموصوف في الجنس والعدد. موقع الصفة في الجملة.',
      importance_points: 'يحسن الوصف. مهم للتعبير. يظهر في القواعد.',
      common_mistakes: 'نسيان التطابق. موقع الصفة الخاطئ. أخطاء في المؤنث.',
    },
    {
      subject_name: 'اللغة الفرنسية',
      title: 'La production écrite',
      summary: 'كيفية كتابة نص متماسك. استخدام الروابط المنطقية. تنظيم الأفكار.',
      importance_points: 'جزء كبير من العلامة. يظهر قدرة التعبير. يتطلب تدريباً مستمراً.',
      common_mistakes: 'عدم التخطيط. نسيان المقدمة والخاتمة. أخطاء في الروابط.',
    },
    // Science lessons
    {
      subject_name: 'العلوم الطبيعية',
      title: 'الخلية - وحدة بناء الكائن الحي',
      summary: 'مكونات الخلية: النواة، السيتوبلازم، الغشاء. الفرق بين الخلية النباتية والحيوانية.',
      importance_points: 'أساس علم الأحياء. يرتبط بكل الوظائف الحيوية. يظهر في كل امتحان.',
      common_mistakes: 'الخلط بين مكونات الخلية. نسيان الفروق. عدم فهم الوظائف.',
    },
    {
      subject_name: 'العلوم الطبيعية',
      title: 'الجهاز الهضمي',
      summary: 'مراحل الهضم من الفم إلى الأمعاء. دور كل عضو في عملية الهضم. الإنزيمات الهاضمة.',
      importance_points: 'فهم التغذية. يرتبط بالصحة. أسئلة تطبيقية كثيرة.',
      common_mistakes: 'الخلط بين الهضم الآلي والكيميائي. نسيان ترتيب الأعضاء. عدم معرفة الإنزيمات.',
    },
    {
      subject_name: 'العلوم الطبيعية',
      title: 'الجهاز التنفسي',
      summary: 'آلية التنفس: الشهيق والزفير. تبادل الغازات في الرئتين. أهمية الأكسجين للخلايا.',
      importance_points: 'فهم الحياة. يرتبط بالصحة والرياضة. تطبيقات عملية.',
      common_mistakes: 'الخلط بين الشهيق والزفير. عدم فهم تبادل الغازات. نسيان دور الحجاب الحاجز.',
    },
    {
      subject_name: 'العلوم الطبيعية',
      title: 'الدورة الدموية',
      summary: 'القلب والأوعية الدموية. الدورة الدموية الكبرى والصغرى. وظيفة الدم.',
      importance_points: 'فهم نقل المواد في الجسم. مهم للصحة. أسئلة رسم البيانات.',
      common_mistakes: 'الخلط بين الشريان والوريد. عدم فهم اتجاه الدم. أخطاء في رسم القلب.',
    },
    {
      subject_name: 'العلوم الطبيعية',
      title: 'البيئة والتلوث',
      summary: 'أنواع التلوث وأسبابه. تأثير التلوث على الكائنات الحية. حماية البيئة.',
      importance_points: 'موضوع حالي ومهم. يرتبط بالتربية المدنية. أسئلة التحليل والوثائق.',
      common_mistakes: 'عدم ربط السبب بالنتيجة. إجابات سطحية. نسيان الحلول.',
    },
    // History/Geography lessons
    {
      subject_name: 'التاريخ والجغرافيا',
      title: 'الثورة الجزائرية 1954-1962',
      summary: 'أسباب اندلاع الثورة. مراحلها الكبرى. أهم الأحداث والشخصيات.',
      importance_points: 'تاريخ وطني أساسي. يظهر دائماً في الامتحان. يرتبط بالهوية.',
      common_mistakes: 'الخلط في التواريخ. عدم معرفة الأحداث بالتسلسل. نسيان الشخصيات.',
    },
    {
      subject_name: 'التاريخ والجغرافيا',
      title: 'الحرب العالمية الثانية',
      summary: 'أسباب الحرب ومراحلها. الدول المشاركة. نتائجها على العالم.',
      importance_points: 'تاريخ عالمي مهم. يرتبط بالاستعمار. أسئلة التحليل.',
      common_mistakes: 'الخلط بين الحربين. عدم فهم التحالفات. نسيان النتائج.',
    },
    {
      subject_name: 'التاريخ والجغرافيا',
      title: 'الجزائر - الموقع والخصائص الطبيعية',
      summary: 'موقع الجزائر الجغرافي. التضاريس والمناخ. الموارد الطبيعية.',
      importance_points: 'أساس الجغرافيا. يرتبط بالاقتصاد. أسئلة الخرائط.',
      common_mistakes: 'أخطاء في الموقع. عدم معرفة التضاريس. الخلط في المناخ.',
    },
    {
      subject_name: 'التاريخ والجغرافيا',
      title: 'السكان في الجزائر',
      summary: 'توزيع السكان. النمو الديموغرافي. المشاكل السكانية والحلول.',
      importance_points: 'موضوع تحليلي. يرتبط بالتنمية. أسئلة البيانات والإحصائيات.',
      common_mistakes: 'عدم فهم المصطلحات. أخطاء في قراءة البيانات. إجابات سطحية.',
    },
    {
      subject_name: 'التاريخ والجغرافيا',
      title: 'الاقتصاد الجزائري',
      summary: 'قطاعات الاقتصاد: الزراعة، الصناعة، الخدمات. دور المحروقات. التحديات الاقتصادية.',
      importance_points: 'فهم الواقع. يرتبط بالتنمية. أسئلة التحليل.',
      common_mistakes: 'عدم الربط بين القطاعات. نسيان الأرقام. إجابات غير منظمة.',
    },
  ];

  const exercises: SeedExercise[] = [
    // Math exercises
    {
      lesson_title: 'المعادلات من الدرجة الأولى',
      difficulty: 1,
      question: 'حل المعادلة: 2x + 5 = 11',
      options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
      correct_index: 1,
      explanation: '2x + 5 = 11 ⟹ 2x = 11 - 5 ⟹ 2x = 6 ⟹ x = 3',
    },
    {
      lesson_title: 'المعادلات من الدرجة الأولى',
      difficulty: 2,
      question: 'حل المعادلة: 3x - 7 = 2x + 5',
      options: ['x = 12', 'x = 2', 'x = -12', 'x = 7'],
      correct_index: 0,
      explanation: '3x - 7 = 2x + 5 ⟹ 3x - 2x = 5 + 7 ⟹ x = 12',
    },
    {
      lesson_title: 'المعادلات من الدرجة الأولى',
      difficulty: 3,
      question: 'حل المعادلة: 4(x - 2) = 2(x + 3)',
      options: ['x = 5', 'x = 7', 'x = 3', 'x = 4'],
      correct_index: 1,
      explanation: '4x - 8 = 2x + 6 ⟹ 2x = 14 ⟹ x = 7',
    },
    {
      lesson_title: 'نظرية فيثاغورس',
      difficulty: 1,
      question: 'في مثلث قائم الضلعان القائمان 3 و 4، ما طول الوتر؟',
      options: ['5', '6', '7', '12'],
      correct_index: 0,
      explanation: 'c² = 3² + 4² = 9 + 16 = 25 ⟹ c = 5',
    },
    {
      lesson_title: 'نظرية فيثاغورس',
      difficulty: 2,
      question: 'مثلث قائم وتره 13 وأحد ضلعيه 5، ما الضلع الآخر؟',
      options: ['8', '10', '12', '18'],
      correct_index: 2,
      explanation: '13² = 5² + b² ⟹ 169 = 25 + b² ⟹ b² = 144 ⟹ b = 12',
    },
    {
      lesson_title: 'نظرية فيثاغورس',
      difficulty: 2,
      question: 'هل المثلث ذو الأضلاع 6، 8، 10 مثلث قائم؟',
      options: ['نعم لأن 10² = 6² + 8²', 'لا لأن 10² ≠ 6² + 8²', 'لا يمكن التحديد', 'نعم لأن الأضلاع زوجية'],
      correct_index: 0,
      explanation: '10² = 100، 6² + 8² = 36 + 64 = 100 ⟹ المثلث قائم',
    },
    {
      lesson_title: 'الكسور والعمليات عليها',
      difficulty: 1,
      question: 'احسب: 1/4 + 1/4',
      options: ['2/8', '1/2', '2/4', '1/8'],
      correct_index: 1,
      explanation: '1/4 + 1/4 = 2/4 = 1/2',
    },
    {
      lesson_title: 'الكسور والعمليات عليها',
      difficulty: 2,
      question: 'احسب: 2/3 × 3/4',
      options: ['6/7', '5/7', '1/2', '6/12'],
      correct_index: 2,
      explanation: '2/3 × 3/4 = 6/12 = 1/2',
    },
    {
      lesson_title: 'الكسور والعمليات عليها',
      difficulty: 2,
      question: 'احسب: 1/2 ÷ 1/4',
      options: ['1/8', '2', '1/2', '4'],
      correct_index: 1,
      explanation: '1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2 = 2',
    },
    // Arabic exercises
    {
      lesson_title: 'أنواع الجمل',
      difficulty: 1,
      question: 'ما نوع الجملة: "الطالب مجتهد"؟',
      options: ['جملة فعلية', 'جملة اسمية', 'جملة استفهامية', 'جملة شرطية'],
      correct_index: 1,
      explanation: 'جملة اسمية لأنها تبدأ باسم (الطالب)',
    },
    {
      lesson_title: 'أنواع الجمل',
      difficulty: 1,
      question: 'ما نوع الجملة: "يدرس التلميذ بجد"؟',
      options: ['جملة اسمية', 'جملة فعلية', 'جملة استفهامية', 'جملة تعجبية'],
      correct_index: 1,
      explanation: 'جملة فعلية لأنها تبدأ بفعل (يدرس)',
    },
    {
      lesson_title: 'أنواع الجمل',
      difficulty: 2,
      question: 'في الجملة "العلم نور"، ما إعراب "نور"؟',
      options: ['مبتدأ مرفوع', 'خبر مرفوع', 'فاعل مرفوع', 'مفعول به منصوب'],
      correct_index: 1,
      explanation: 'نور: خبر مرفوع بالضمة، لأنه يخبر عن المبتدأ "العلم"',
    },
    {
      lesson_title: 'علامات الإعراب',
      difficulty: 1,
      question: 'ما علامة رفع الاسم المفرد؟',
      options: ['الفتحة', 'الكسرة', 'الضمة', 'السكون'],
      correct_index: 2,
      explanation: 'الاسم المفرد يُرفع بالضمة',
    },
    {
      lesson_title: 'علامات الإعراب',
      difficulty: 2,
      question: 'في "رأيت الطالبَ"، ما إعراب "الطالب"؟',
      options: ['فاعل مرفوع', 'مفعول به منصوب', 'اسم مجرور', 'خبر مرفوع'],
      correct_index: 1,
      explanation: 'الطالب: مفعول به منصوب بالفتحة',
    },
    {
      lesson_title: 'علامات الإعراب',
      difficulty: 2,
      question: 'ما علامة جر الاسم المفرد؟',
      options: ['الفتحة', 'الكسرة', 'الضمة', 'الألف'],
      correct_index: 1,
      explanation: 'الاسم المفرد يُجر بالكسرة',
    },
    // French exercises
    {
      lesson_title: 'Les temps verbaux',
      difficulty: 1,
      question: 'Conjuguez "être" au présent avec "nous":',
      options: ['nous sommes', 'nous avons', 'nous êtes', 'nous sont'],
      correct_index: 0,
      explanation: 'Être au présent: je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont',
    },
    {
      lesson_title: 'Les temps verbaux',
      difficulty: 2,
      question: 'Quel est le passé composé de "je mange"?',
      options: ["j'ai mangé", "j'ai manger", 'je suis mangé', 'je mange'],
      correct_index: 0,
      explanation: 'Le passé composé se forme avec avoir/être + participe passé: j\'ai mangé',
    },
    {
      lesson_title: 'Les temps verbaux',
      difficulty: 2,
      question: 'Conjuguez "aller" au futur simple avec "tu":',
      options: ['tu vas', 'tu iras', 'tu alleras', 'tu es allé'],
      correct_index: 1,
      explanation: 'Aller au futur: j\'irai, tu iras, il ira, nous irons, vous irez, ils iront',
    },
    {
      lesson_title: 'Les pronoms personnels',
      difficulty: 1,
      question: 'Remplacez "le livre" par un pronom: "Je lis le livre"',
      options: ['Je lui lis', 'Je la lis', 'Je le lis', 'Je les lis'],
      correct_index: 2,
      explanation: '"Le livre" est masculin singulier, on utilise "le": Je le lis',
    },
    {
      lesson_title: 'Les pronoms personnels',
      difficulty: 2,
      question: 'Quel pronom remplace "à Marie"?',
      options: ['la', 'le', 'lui', 'leur'],
      correct_index: 2,
      explanation: 'Pour les COI (à + personne), on utilise "lui" au singulier',
    },
    {
      lesson_title: 'Les pronoms personnels',
      difficulty: 2,
      question: 'Comment dit-on "Je donne le livre à Pierre"?',
      options: ['Je le lui donne', 'Je lui le donne', 'Je le donne lui', 'Je lui donne le'],
      correct_index: 0,
      explanation: 'Ordre des pronoms: sujet + COD + COI + verbe ⟹ Je le lui donne',
    },
    // Science exercises
    {
      lesson_title: 'الخلية - وحدة بناء الكائن الحي',
      difficulty: 1,
      question: 'ما العضية المسؤولة عن التحكم في الخلية؟',
      options: ['السيتوبلازم', 'النواة', 'الغشاء البلازمي', 'الميتوكوندري'],
      correct_index: 1,
      explanation: 'النواة هي مركز التحكم في الخلية وتحتوي على المادة الوراثية',
    },
    {
      lesson_title: 'الخلية - وحدة بناء الكائن الحي',
      difficulty: 2,
      question: 'ما الذي يميز الخلية النباتية عن الحيوانية؟',
      options: ['وجود النواة', 'وجود الجدار الخلوي', 'وجود السيتوبلازم', 'وجود الغشاء'],
      correct_index: 1,
      explanation: 'الخلية النباتية تتميز بوجود جدار خلوي وبلاستيدات خضراء',
    },
    {
      lesson_title: 'الخلية - وحدة بناء الكائن الحي',
      difficulty: 2,
      question: 'أين يتم التنفس الخلوي؟',
      options: ['في النواة', 'في الميتوكوندري', 'في الغشاء', 'في الجدار الخلوي'],
      correct_index: 1,
      explanation: 'الميتوكوندري هي مصانع الطاقة في الخلية حيث يتم التنفس الخلوي',
    },
    {
      lesson_title: 'الجهاز الهضمي',
      difficulty: 1,
      question: 'أين يبدأ الهضم الآلي للطعام؟',
      options: ['المعدة', 'الفم', 'الأمعاء الدقيقة', 'المريء'],
      correct_index: 1,
      explanation: 'يبدأ الهضم في الفم حيث تقوم الأسنان بتقطيع الطعام (هضم آلي)',
    },
    {
      lesson_title: 'الجهاز الهضمي',
      difficulty: 2,
      question: 'ما الإنزيم الذي يهضم النشويات في الفم؟',
      options: ['الببسين', 'الأميلاز اللعابي', 'الليباز', 'التربسين'],
      correct_index: 1,
      explanation: 'الأميلاز اللعابي يحول النشويات إلى سكريات بسيطة',
    },
    {
      lesson_title: 'الجهاز الهضمي',
      difficulty: 2,
      question: 'أين يتم امتصاص معظم الغذاء؟',
      options: ['المعدة', 'الأمعاء الغليظة', 'الأمعاء الدقيقة', 'المريء'],
      correct_index: 2,
      explanation: 'الأمعاء الدقيقة هي المكان الرئيسي لامتصاص الغذاء بفضل الزغابات',
    },
    // History exercises
    {
      lesson_title: 'الثورة الجزائرية 1954-1962',
      difficulty: 1,
      question: 'متى اندلعت الثورة الجزائرية؟',
      options: ['1 نوفمبر 1945', '1 نوفمبر 1954', '5 يوليو 1962', '8 مايو 1945'],
      correct_index: 1,
      explanation: 'اندلعت الثورة التحريرية في الفاتح من نوفمبر 1954',
    },
    {
      lesson_title: 'الثورة الجزائرية 1954-1962',
      difficulty: 2,
      question: 'ما اسم الحزب الذي فجّر الثورة؟',
      options: ['حزب الشعب الجزائري', 'جبهة التحرير الوطني', 'الاتحاد الديمقراطي', 'حركة انتصار الحريات'],
      correct_index: 1,
      explanation: 'جبهة التحرير الوطني (FLN) هي التي أطلقت الثورة وقادتها',
    },
    {
      lesson_title: 'الثورة الجزائرية 1954-1962',
      difficulty: 2,
      question: 'متى استقلت الجزائر؟',
      options: ['1 نوفمبر 1954', '19 مارس 1962', '5 يوليو 1962', '3 يوليو 1962'],
      correct_index: 2,
      explanation: 'أعلن الاستقلال رسمياً في 5 يوليو 1962 بعد استفتاء تقرير المصير',
    },
    {
      lesson_title: 'الحرب العالمية الثانية',
      difficulty: 1,
      question: 'متى بدأت الحرب العالمية الثانية؟',
      options: ['1914', '1939', '1945', '1918'],
      correct_index: 1,
      explanation: 'بدأت الحرب العالمية الثانية في سبتمبر 1939 بغزو ألمانيا لبولندا',
    },
    {
      lesson_title: 'الحرب العالمية الثانية',
      difficulty: 2,
      question: 'ما هي دول المحور؟',
      options: ['فرنسا، بريطانيا، أمريكا', 'ألمانيا، إيطاليا، اليابان', 'روسيا، الصين، الهند', 'كندا، أستراليا، مصر'],
      correct_index: 1,
      explanation: 'دول المحور الرئيسية: ألمانيا النازية، إيطاليا الفاشية، اليابان الإمبراطورية',
    },
    {
      lesson_title: 'الحرب العالمية الثانية',
      difficulty: 2,
      question: 'متى انتهت الحرب العالمية الثانية؟',
      options: ['1943', '1944', '1945', '1946'],
      correct_index: 2,
      explanation: 'انتهت الحرب في 1945: في مايو في أوروبا وسبتمبر في آسيا',
    },
  ];

  return { subjects, lessons, exercises };
}
