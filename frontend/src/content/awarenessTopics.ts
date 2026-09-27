/**
 * General-audience health awareness topics (General → Awareness).
 *
 * Plain-language summaries of public health guidance, not medical advice. Every topic links to the
 * authoritative sources it draws on; keep the text in line with them when editing. Screening ages follow
 * the USPSTF A/B recommendations as of 2026.
 */

export interface AwarenessSection {
  title: string
  items: string[]
}

export interface AwarenessTopic {
  /** URL slug. */
  id: string
  title: string
  icon: string
  /** One line, shown in the topic list. */
  summary: string
  overview: string
  /** Shown prominently near the top when set. */
  emergency?: string
  sections: AwarenessSection[]
  sources: { label: string; url: string }[]
}

export const AWARENESS_TOPICS: AwarenessTopic[] = [
  {
    id: 'cardiovascular-health',
    title: 'Cardiovascular health',
    icon: '❤️',
    summary: 'Heart disease and stroke: know the warning signs and lower your risk.',
    overview:
      'Heart disease is the leading cause of death in the United States. Many of its risk factors, like high blood pressure, high cholesterol, smoking, diabetes and inactivity, can be managed, which lowers the chance of a heart attack or stroke.',
    emergency:
      'Chest pain or pressure, pain spreading to the arm, jaw or back, shortness of breath, or sudden face drooping, arm weakness or trouble speaking can mean a heart attack or stroke. Call 911 right away.',
    sections: [
      {
        title: 'Warning signs',
        items: [
          'Chest pain or discomfort that lasts more than a few minutes or goes away and comes back',
          'Pain or discomfort in the jaw, neck, back, or one or both arms or shoulders',
          'Shortness of breath, light-headedness, fainting or a cold sweat',
          'Unusual tiredness, nausea or vomiting (more common in women)',
          'Stroke: sudden numbness or weakness of the face, arm or leg (especially one side), confusion, trouble speaking or seeing, or a sudden severe headache',
        ],
      },
      {
        title: 'Lower your risk',
        items: [
          'Know your blood pressure and cholesterol numbers',
          "Don't smoke or vape, and avoid secondhand smoke",
          'Aim for at least 150 minutes of moderate activity a week, such as brisk walking',
          'Eat plenty of vegetables, fruits and whole grains, with less salt, added sugar and saturated fat',
          'Keep diabetes and weight under control, and limit alcohol',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          'A high blood pressure reading at home or at a pharmacy',
          'A family history of early heart disease or stroke',
          'Getting short of breath, tired or swollen in the legs more easily than before',
          "If you're not sure when your blood pressure or cholesterol was last checked",
        ],
      },
    ],
    sources: [
      { label: 'CDC: Heart disease', url: 'https://www.cdc.gov/heart-disease/index.html' },
      { label: 'CDC: Heart attack symptoms', url: 'https://www.cdc.gov/heart-disease/about/heart-attack.html' },
      { label: 'CDC: Signs and symptoms of stroke', url: 'https://www.cdc.gov/stroke/signs-symptoms/index.html' },
    ],
  },
  {
    id: 'diabetes',
    title: 'Diabetes',
    icon: '🩸',
    summary: 'High blood sugar: spot the signs early and prevent type 2 diabetes.',
    overview:
      "Diabetes affects how your body turns food into energy, leaving too much sugar in the blood. Type 2 is the most common kind and can often be prevented or delayed. Prediabetes usually has no symptoms, so many people don't know they have it.",
    emergency:
      'In someone with diabetes, confusion, fainting, trouble breathing, fruity-smelling breath or repeated vomiting can be an emergency. Call 911.',
    sections: [
      {
        title: 'Warning signs',
        items: [
          'Urinating often, especially at night',
          'Being very thirsty or very hungry',
          'Losing weight without trying',
          'Blurry vision',
          'Numb or tingling hands or feet',
          'Feeling very tired, or sores that heal slowly',
        ],
      },
      {
        title: 'Lower your risk',
        items: [
          "If you're overweight, losing even a small amount of weight (about 5–7% of your body weight) can lower your risk",
          'Aim for at least 150 minutes of activity a week',
          'Drink water instead of sugary drinks',
          'Choose high-fiber foods like vegetables, beans and whole grains',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          'You have any of the warning signs above',
          "You're 35 or older and overweight, or have a family history of diabetes. Ask about a blood sugar (A1C) test",
          'You had diabetes during a pregnancy (gestational diabetes)',
        ],
      },
    ],
    sources: [
      { label: 'CDC: Diabetes', url: 'https://www.cdc.gov/diabetes/index.html' },
      { label: 'CDC: Prediabetes risk test', url: 'https://www.cdc.gov/prediabetes/risktest/index.html' },
      { label: 'NIH (NIDDK): Diabetes', url: 'https://www.niddk.nih.gov/health-information/diabetes' },
    ],
  },
  {
    id: 'cancer-awareness',
    title: 'Cancer awareness',
    icon: '🎗️',
    summary: 'Changes worth checking, and the habits and screenings that lower risk.',
    overview:
      'Cancer is a group of diseases in which abnormal cells grow out of control. Not using tobacco, protecting your skin, some vaccines and recommended screenings can lower your risk or find cancer early, when it is easier to treat.',
    sections: [
      {
        title: 'Changes worth checking',
        items: [
          'A new lump or thickening anywhere in the body',
          "A change in a mole, or a skin sore that doesn't heal",
          'Losing weight without trying',
          "A cough or hoarseness that won't go away",
          'Changes in bowel or bladder habits, or blood in your stool or urine',
          'Unusual bleeding, trouble swallowing, or ongoing indigestion',
        ],
      },
      {
        title: 'Lower your risk',
        items: [
          "Don't use tobacco in any form",
          'Protect your skin with shade, clothing and sunscreen; avoid tanning beds',
          'Limit alcohol, stay active and keep a healthy weight',
          'Get the HPV and hepatitis B vaccines if recommended for you',
          'Keep up with recommended screenings (see Preventive screening)',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          'Any of the changes above that last more than a couple of weeks. Most are caused by something other than cancer, but they should be checked',
          'You have a strong family history of cancer, which may mean screening earlier',
        ],
      },
    ],
    sources: [
      { label: 'National Cancer Institute: About cancer', url: 'https://www.cancer.gov/about-cancer' },
      { label: 'CDC: Cancer', url: 'https://www.cdc.gov/cancer/index.html' },
      {
        label: 'American Cancer Society: Signs and symptoms',
        url: 'https://www.cancer.org/cancer/diagnosis-staging/signs-and-symptoms-of-cancer.html',
      },
    ],
  },
  {
    id: 'respiratory-health',
    title: 'Respiratory health',
    icon: '🫁',
    summary: 'Asthma, COPD and lung infections: protect your lungs and breathe easier.',
    overview:
      'Your lungs can be affected by long-term conditions like asthma and COPD, and by infections such as flu, COVID-19 and pneumonia. Smoking, air pollution, radon and some workplace exposures damage the lungs over time.',
    emergency:
      'Severe trouble breathing, lips or face turning blue or gray, or chest pain with breathlessness: call 911.',
    sections: [
      {
        title: 'Warning signs',
        items: [
          'A cough that lasts more than 3 weeks',
          'Getting short of breath during everyday activities',
          'Wheezing or a tight chest',
          'Coughing up blood',
          'Frequent chest infections',
        ],
      },
      {
        title: 'Protect your lungs',
        items: [
          "Don't smoke or vape, and avoid secondhand smoke",
          'Test your home for radon',
          'Check air quality alerts and limit time outside on bad days',
          'Stay up to date on flu, COVID-19 and other recommended vaccines',
          'If you have asthma, follow your asthma action plan and know your triggers',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          'A cough that lasts more than 3 weeks',
          'Getting breathless doing things you used to do easily',
          'Needing your rescue inhaler more often than usual',
        ],
      },
    ],
    sources: [
      { label: 'American Lung Association: Lung health and diseases', url: 'https://www.lung.org/lung-health-diseases' },
      { label: 'CDC: Asthma', url: 'https://www.cdc.gov/asthma/index.html' },
      { label: 'EPA: Radon', url: 'https://www.epa.gov/radon' },
    ],
  },
  {
    id: 'mental-wellness',
    title: 'Mental wellness',
    icon: '🧠',
    summary: 'Depression, anxiety and stress are common and treatable. Help is available.',
    overview:
      'Mental health affects how we think, feel and act. Depression and anxiety are common and treatable, and reaching out for help is a sign of strength, not weakness.',
    emergency:
      "If you or someone you know is thinking about suicide or is in crisis, call or text 988 (Suicide & Crisis Lifeline) any time. If there's immediate danger, call 911.",
    sections: [
      {
        title: 'Signs to watch for',
        items: [
          'Feeling sad, hopeless or empty most days for 2 weeks or more',
          'Losing interest in things you used to enjoy',
          'Big changes in sleep or appetite',
          'Constant worry, restlessness or panic attacks',
          'Pulling away from friends and family',
          'Using alcohol or drugs to cope',
        ],
      },
      {
        title: 'Everyday habits that help',
        items: [
          'Keep a regular sleep schedule',
          'Move your body; even short walks help',
          'Stay connected with people you trust',
          'Limit alcohol',
          'Take breaks for things that calm you, like breathing exercises or time outdoors',
        ],
      },
      {
        title: 'When to get help',
        items: [
          'Symptoms last more than 2 weeks, or get in the way of work, school or relationships',
          'Start with your doctor or a mental health professional; SAMHSA’s free helpline (1-800-662-4357) can help you find treatment',
        ],
      },
    ],
    sources: [
      { label: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org/' },
      { label: 'NIH (NIMH): Mental health topics', url: 'https://www.nimh.nih.gov/health' },
      { label: 'SAMHSA National Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline' },
    ],
  },
  {
    id: 'infectious-diseases',
    title: 'Infectious diseases',
    icon: '🦠',
    summary: 'How germs spread, and simple steps that stop most infections.',
    overview:
      'Infectious diseases are caused by germs such as viruses, bacteria, fungi and parasites. They can spread from person to person, through food and water, or through insects and animals. Vaccines, handwashing and staying home when sick prevent many of them.',
    emergency:
      'Get emergency care for trouble breathing, chest pain, confusion, a stiff neck with a high fever, or signs of severe dehydration such as very little urine and dizziness.',
    sections: [
      {
        title: 'Common symptoms',
        items: [
          'Fever or chills',
          'Cough, sore throat or runny nose',
          'Vomiting or diarrhea',
          'A new rash',
          'Unusual tiredness or body aches',
        ],
      },
      {
        title: 'Prevent the spread',
        items: [
          'Wash your hands with soap for at least 20 seconds, especially before eating and after using the bathroom',
          'Stay up to date on recommended vaccines',
          'Stay home when you are sick, and cover coughs and sneezes',
          'Handle food safely: clean, separate, cook and chill',
          'Use insect repellent and check for ticks after time outdoors',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          'A high fever, or a fever that lasts several days',
          'Symptoms that get worse instead of better',
          'A rash with a fever, or a rash or fever after a tick bite',
          "You're pregnant, older, or have a weakened immune system and get sick",
        ],
      },
    ],
    sources: [
      { label: 'CDC: About handwashing', url: 'https://www.cdc.gov/clean-hands/about/index.html' },
      { label: 'CDC: Food safety', url: 'https://www.cdc.gov/food-safety/index.html' },
      { label: 'WHO: Fact sheets', url: 'https://www.who.int/news-room/fact-sheets' },
    ],
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    icon: '🥗',
    summary: 'Everyday eating patterns that support energy and long-term health.',
    overview:
      'What you eat affects your energy and your risk of heart disease, type 2 diabetes and some cancers. There is no single perfect diet; your overall eating pattern over time matters most.',
    sections: [
      {
        title: 'Build a healthy plate',
        items: [
          'Fill half your plate with vegetables and fruits',
          'Choose whole grains, like oats, brown rice and whole-wheat bread',
          'Vary your proteins: beans, fish, eggs, nuts, poultry and lean meats',
          'Limit added sugars, salt and saturated fat',
          'Drink water instead of sugary drinks',
          'Use the Nutrition Facts label to compare foods',
        ],
      },
      {
        title: 'Signs to watch for',
        items: [
          'Losing or gaining weight without meaning to',
          'Feeling tired all the time',
          'Eating a very limited range of foods',
          'Trouble affording enough food. Call 211 to find local food programs',
        ],
      },
      {
        title: 'When to see a doctor or dietitian',
        items: [
          'You have a condition like diabetes, heart disease or kidney disease that affects what you should eat',
          "You're pregnant or planning to be",
          "You're thinking about taking supplements",
        ],
      },
    ],
    sources: [
      { label: 'USDA MyPlate', url: 'https://www.myplate.gov/' },
      {
        label: 'FDA: How to use the Nutrition Facts label',
        url: 'https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label',
      },
    ],
  },
  {
    id: 'preventive-screening',
    title: 'Preventive screening',
    icon: '🔍',
    summary: 'Tests that find problems early, before you have symptoms.',
    overview:
      'Screening tests look for disease before you have symptoms, when it is often easier to treat. Which tests you need depends on your age, sex, family history and other risks.',
    sections: [
      {
        title: 'Common screenings for adults',
        items: [
          'Blood pressure: all adults 18 and older',
          'Colorectal cancer: ages 45 to 75',
          'Breast cancer (mammogram): women 40 to 74, every 2 years',
          'Cervical cancer: women 21 to 65',
          'Lung cancer: ages 50 to 80 with a 20 pack-year smoking history who smoke now or quit in the past 15 years',
          'Prediabetes and type 2 diabetes: ages 35 to 70 who are overweight',
          'HIV: ages 15 to 65; hepatitis C: ages 18 to 79 (at least once)',
          'Osteoporosis: women 65 and older, and younger women past menopause at higher risk',
          'Depression (all adults) and anxiety (adults 64 and younger)',
        ],
      },
      {
        title: 'Good to know',
        items: [
          'These are general recommendations for people at average risk; your doctor may suggest starting earlier or testing more often',
          "Screenings are for people without symptoms. If you notice a new lump, bleeding or other change, see a doctor instead of waiting for your next screening",
          'Most insurance plans cover these screenings at no cost to you',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          "At a yearly checkup, ask which screenings you're due for",
          'If a close relative had cancer, heart disease or diabetes, especially at a young age',
        ],
      },
    ],
    sources: [
      {
        label: 'USPSTF: A and B recommendations',
        url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations',
      },
      { label: 'MyHealthfinder: personalized recommendations', url: 'https://odphp.health.gov/myhealthfinder' },
      { label: 'CDC: Cancer', url: 'https://www.cdc.gov/cancer/index.html' },
    ],
  },
  {
    id: 'vaccinations',
    title: 'Vaccinations',
    icon: '💉',
    summary: 'Adults need vaccines too. Find out which ones are right for you.',
    overview:
      'Vaccines train your immune system to fight specific infections. Adults need them too: some every year, like the flu shot, and some as boosters. Which ones you need depends on your age, health, job, travel and whether you are pregnant.',
    emergency:
      'Signs of a severe allergic reaction after a vaccine, such as trouble breathing, swelling of the face or throat, hives all over, a fast heartbeat or dizziness: call 911.',
    sections: [
      {
        title: 'Vaccines to ask about',
        items: [
          'Flu: every year',
          'Tetanus, diphtheria and whooping cough (Td/Tdap): a booster every 10 years',
          'Shingles: for adults 50 and older',
          'COVID-19, pneumococcal (pneumonia), RSV, HPV and hepatitis B, depending on your age and health',
        ],
      },
      {
        title: 'What to expect',
        items: [
          'A sore arm, mild fever or tiredness for a day or two is common and normal',
          'Serious reactions are rare, and vaccine providers are prepared to treat them',
        ],
      },
      {
        title: 'When to talk to a doctor or pharmacist',
        items: [
          "You're not sure which vaccines you've had. Your state immunization registry may have your records",
          "You're pregnant, planning travel abroad, or have a weakened immune system",
          'You had a reaction to a vaccine before',
        ],
      },
    ],
    sources: [
      { label: 'CDC: Vaccines for adults', url: 'https://www.cdc.gov/vaccines-adults/index.html' },
      { label: 'CDC: Adult immunization schedule', url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/adult-age.html' },
      { label: 'WHO: Vaccines and immunization', url: 'https://www.who.int/health-topics/vaccines-and-immunization' },
    ],
  },
  {
    id: 'medication-safety',
    title: 'Medication safety',
    icon: '💊',
    summary: 'Take, store and dispose of medicines safely, and avoid mix-ups.',
    overview:
      'Medicines help when used correctly, but mistakes, interactions and taking too much send many people to the emergency room each year. A few habits make them much safer.',
    emergency:
      'If someone took too much of a medicine or the wrong one, call Poison Control at 1-800-222-1222 (free, 24/7). If they are unconscious, having a seizure or struggling to breathe, call 911.',
    sections: [
      {
        title: 'Safe habits',
        items: [
          'Keep an up-to-date list of everything you take, including over-the-counter medicines, vitamins and supplements',
          'Take medicines exactly as prescribed, and read the label every time',
          'Check active ingredients so you don’t double up (for example, acetaminophen is in many cold medicines)',
          'Ask your pharmacist about interactions, including with alcohol',
          'Use the measuring device that comes with liquid medicines',
          "Never share prescriptions, and store medicines up and away from children",
          'Take unused medicines to a drug take-back site',
        ],
      },
      {
        title: 'Signs to watch for',
        items: [
          'A new rash, dizziness, confusion or upset stomach after starting a medicine',
          "Feeling like a medicine isn't working",
          'Side effects that make you want to stop taking it',
        ],
      },
      {
        title: 'When to talk to a doctor or pharmacist',
        items: [
          'Before stopping a prescription medicine',
          'If you take several medicines. Ask for a medication review',
          "If you're pregnant or breastfeeding",
        ],
      },
    ],
    sources: [
      { label: 'FDA: Resources for you (drugs)', url: 'https://www.fda.gov/drugs/resources-you-drugs' },
      {
        label: 'FDA: Disposing of unused medicines',
        url: 'https://www.fda.gov/drugs/safe-disposal-medicines/disposal-unused-medicines-what-you-should-know',
      },
      { label: 'Poison Control', url: 'https://www.poison.org/' },
    ],
  },
  {
    id: 'aging-senior-health',
    title: 'Aging / senior health',
    icon: '👵',
    summary: 'Staying active, independent and safe as you get older.',
    overview:
      'Healthy habits at any age help older adults stay active, independent and connected. Regular checkups matter more with age, as the risks of falls, memory changes, and vision and hearing loss go up.',
    emergency:
      'Sudden confusion, weakness on one side of the body, trouble speaking, or a fall with a head injury: call 911.',
    sections: [
      {
        title: 'Signs to watch for',
        items: [
          'Memory problems that disrupt daily life, like getting lost in familiar places or repeating questions',
          'Falls, or feeling unsteady on your feet',
          'Changes in hearing or vision',
          'Feeling lonely or down',
          'Losing weight without trying',
          'Trouble managing medicines, bills or daily tasks',
        ],
      },
      {
        title: 'Stay healthy and safe',
        items: [
          'Stay active, including exercises for strength and balance',
          'Make your home safer: good lighting, grab bars, and no loose rugs or clutter to trip on',
          'Get a yearly wellness visit, plus vision and hearing checks',
          'Review all your medicines with your doctor or pharmacist once a year',
          'Stay connected with family, friends and your community',
          'Ask about flu, shingles, pneumococcal and RSV vaccines',
        ],
      },
      {
        title: 'When to see a doctor',
        items: [
          'After any fall, even if you were not hurt',
          'When you or people close to you notice changes in memory or thinking',
          'When everyday activities become harder',
        ],
      },
    ],
    sources: [
      { label: 'NIH (NIA): Health topics for older adults', url: 'https://www.nia.nih.gov/health' },
      { label: 'CDC: Older adult fall prevention', url: 'https://www.cdc.gov/falls/about/index.html' },
      { label: "Alzheimer's Association: 10 warning signs", url: 'https://www.alz.org/alzheimers-dementia/10_signs' },
    ],
  },
]
