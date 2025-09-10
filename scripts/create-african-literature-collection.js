const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function getEnvironment() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
  return await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
}

// Size mapping system
const sizeMapping = {
  XS: { front: '7dG9T8tnJwuamBDfBfLoeq', side: '34nWVAWGx2yKgs8kZz9YBp' },
  SM: { front: '6UosV9tUXCkwn4sxzxi2Cp', side: 'OuerSi1YTfPPLkF2nJ70w' },
  MD: { front: '2X2koL053KqxOR7VfAjGpS', side: '5QSZ6oFRrhZTqOygZejI5l' },
  LG: { front: '5VdkmTfiiaL8EYoC99quEO', side: 'Wf1GaODJaewJEeiIyMqUJ' },
  XL: { front: '4ZdDgvoCXQsVEKzh6Advsq', side: '6n3fr7Ho62MEx5jbhdS6ji' }
}

// Convert dimensions to size category
function mapDimensionsToSize(heightCm, widthCm) {
  const heightMm = heightCm * 10
  const widthMm = widthCm * 10
  
  // Size mappings based on template system
  if (heightMm <= 180) return 'XS' // ≤18cm
  if (heightMm <= 200) return 'SM' // 18-20cm
  if (heightMm <= 230) return 'MD' // 20-23cm
  if (heightMm <= 260) return 'LG' // 23-26cm
  return 'XL' // >26cm
}

// Book data with researched dimensions and metadata
const booksData = [
  {
    title: 'Mother to Mother',
    author: 'Sindiwe Magona',
    publishDate: '1998-12-31',
    isbn10: '0864864337',
    isbn13: '978-0864864338',
    publisher: 'David Philip Publishers',
    pages: 216,
    realDimensions: '13.5 x 21 cm', // Based on research
    heightCm: 21,
    widthCm: 13.5,
    genre: 'Fiction',
    subGenre: 'South African Literature',
    price: 28,
    description: `# Mother to Mother by Sindiwe Magona

A profound and haunting novel that explores the devastating impact of apartheid on South African society through the lens of a mother's anguish. Written as a letter from a black mother to the white mother of her son's victim, this powerful work examines the complex web of violence, poverty, and desperation that shaped life in the townships.

Magona's semi-autobiographical novel is based on the true story of Amy Biehl, an American Fulbright scholar who was killed by a mob in a South African township in 1993. The narrative delves deep into the psychological and social forces that create such tragedies, offering a nuanced understanding of how apartheid's legacy continued to poison communities even after its official end.

Winner of the Commonwealth Writers' Prize for Africa, Mother to Mother stands as a masterpiece of post-apartheid literature, demonstrating Magona's exceptional ability to transform personal and collective trauma into profound art.`,
    authorBio: `Sindiwe Magona is a South African novelist, short-story writer, poet, and playwright born in 1943 in the Transkei. She grew up in the townships of Cape Town during apartheid and later became the first black woman to work as a domestic worker at the United Nations in New York.

Magona's writing draws extensively from her experiences of apartheid, poverty, and exile. Her works include the autobiographical trilogy To My Children's Children and Forced to Grow, as well as novels like Living, Loving, and Lying Awake at Night. She has received numerous awards for her contributions to South African literature and her unflinching portrayal of the country's complex social realities.`
  },
  {
    title: 'Double Negative',
    author: 'Ivan Vladislavić',
    publishDate: '2013-11-01',
    isbn10: '1908276266',
    isbn13: '978-1908276261',
    publisher: 'And Other Stories',
    pages: 256,
    realDimensions: '19.5 x 13.4 cm', // Based on research
    heightCm: 19.5,
    widthCm: 13.4,
    genre: 'Fiction',
    subGenre: 'Contemporary South African Literature',
    price: 32,
    description: `# Double Negative by Ivan Vladislavić

A mesmerizing exploration of post-apartheid Johannesburg through the eyes of Neville Lister, an obsessive proofreader who becomes fascinated with the city's rapid transformation. This innovative novel captures the anxiety and possibility of the new South Africa through its protagonist's meticulous attention to the changing urban landscape.

Vladislavić masterfully weaves together themes of memory, belonging, and identity as Neville documents the city's evolution with photographic precision. The narrative becomes a meditation on how we read and misread the world around us, questioning what it means to belong in a place that is constantly reinventing itself.

Originally part of a collaborative project with renowned photographer David Goldblatt, Double Negative won the University of Johannesburg Creative Writing Prize and was shortlisted for the Sunday Times Fiction Prize. The novel showcases Vladislavić's distinctive voice and his ability to find profound meaning in the mundane details of urban life.`,
    authorBio: `Ivan Vladislavić is a South African writer, editor, and literary critic born in 1957 in Pretoria. He is considered one of the most important voices in contemporary South African literature, known for his innovative narrative techniques and keen observations of urban life.

Vladislavić's novels include The Restless Supermarket, The Exploded View, and 101 Detectives. He has won numerous awards including the Alan Paton Award and the Sunday Times Fiction Prize. His work often explores the changing landscape of post-apartheid South Africa, particularly focusing on Johannesburg's transformation and the psychological impact of social change on ordinary people.`
  },
  {
    title: "You Can't Get Lost in Cape Town",
    author: 'Zoë Wicomb',
    publishDate: '1987-05-21',
    isbn10: '0860688208',
    isbn13: '978-0860688204',
    publisher: 'Virago',
    pages: 184,
    realDimensions: '19.7 x 12.6 cm', // Based on research
    heightCm: 19.7,
    widthCm: 12.6,
    genre: 'Fiction',
    subGenre: 'South African Literature',
    price: 26,
    description: `# You Can't Get Lost in Cape Town by Zoë Wicomb

A groundbreaking collection of interconnected stories that follows Frieda Shenton, a young coloured woman navigating the complexities of apartheid South Africa. Wicomb's debut work offers an unflinching examination of racial classification, identity, and belonging in a society built on artificial divisions.

The stories trace Frieda's journey from childhood in the rural Cape to her education in Cape Town and eventual exile in London. Through her experiences, Wicomb illuminates the particular challenges faced by those classified as "coloured" under apartheid, caught between black and white communities and fully accepted by neither.

This influential work established Wicomb as a major voice in South African literature and helped shape the literary landscape of the post-apartheid era. The collection's exploration of racial identity, gender, and exile continues to resonate with readers worldwide, making it essential reading for understanding the complexity of South African society.`,
    authorBio: `Zoë Wicomb is a South African writer born in 1948 in the Western Cape. She was classified as "coloured" under apartheid and later studied at the University of the Western Cape before moving to England for further education at the University of Reading.

Wicomb's works include the novels David's Story and Playing in the Light, as well as several collections of short stories. She has been a pioneer in exploring the experiences of coloured South Africans in literature and has received numerous awards for her contributions to South African writing. She currently lives in Scotland and continues to write about themes of identity, race, and belonging.`
  },
  {
    title: 'The Heart of Redness',
    author: 'Zakes Mda',
    publishDate: '2002-08-01',
    isbn10: '0312421745',
    isbn13: '978-0312421748',
    publisher: 'Farrar, Straus and Giroux',
    pages: 288,
    realDimensions: '21 x 14 cm', // Standard US trade paperback size
    heightCm: 21,
    widthCm: 14,
    genre: 'Fiction',
    subGenre: 'Xhosa Historical Fiction',
    price: 30,
    description: `# The Heart of Redness by Zakes Mda

A masterful novel that weaves together past and present, exploring the 1850s Xhosa cattle-killing movement and its reverberations in contemporary South Africa. Mda creates a compelling narrative that examines the tension between tradition and modernity, development and preservation, through the lens of a divided community in the Eastern Cape.

The story alternates between the 19th century, when the prophet Nongqawuse convinced the Xhosa people to kill their cattle and destroy their crops to drive out the colonizers, and the present day, where the community is divided over whether to build a casino and tourism development. Through this parallel structure, Mda explores how historical trauma continues to shape contemporary decisions.

Shortlisted for the Commonwealth Writers Prize, The Heart of Redness showcases Mda's unique ability to blend African storytelling traditions with contemporary literary techniques. The novel stands as both a gripping historical narrative and a profound meditation on the costs of progress and the persistence of memory.`,
    authorBio: `Zakes Mda is a South African novelist, poet, and playwright born in 1948 in Herschel, Eastern Cape. He spent much of his childhood in Lesotho and later lived in exile during apartheid, studying in the United States where he earned a PhD in theatre.

Mda is known for his innovative blend of African oral traditions with contemporary literary forms. His novels include Ways of Dying, The Madonna of Excelsior, and Cion. He has won numerous awards including the Commonwealth Writers Prize and has been praised for his magical realist style and his exploration of South African history and culture. He divides his time between South Africa and the United States.`
  },
  {
    title: 'Waiting for the Barbarians',
    author: 'J.M. Coetzee',
    publishDate: '1980-01-01',
    isbn10: '0099465930',
    isbn13: '978-0099465935',
    publisher: 'Vintage',
    pages: 176,
    realDimensions: '19.8 x 12.9 cm', // Based on research
    heightCm: 19.8,
    widthCm: 12.9,
    genre: 'Fiction',
    subGenre: 'Allegorical Fiction',
    price: 25,
    description: `# Waiting for the Barbarians by J.M. Coetzee

A haunting allegory of empire and oppression that follows a colonial magistrate who begins to question the brutal methods of his own civilization. Set in an unnamed frontier outpost, the novel explores themes of power, complicity, and moral awakening through the eyes of a man forced to confront his role in an unjust system.

When Colonel Joll arrives to interrogate barbarian prisoners, the magistrate witnesses torture and cruelty that challenge his comfortable existence. His growing conscience leads him to aid a barbarian girl, an act that ultimately brands him a traitor to his own people. Coetzee masterfully examines how ordinary people become complicit in systems of oppression and what it costs to resist.

Winner of both the James Tait Black Memorial Prize and the Geoffrey Faber Memorial Prize, Waiting for the Barbarians stands as one of the most powerful anti-colonial novels in modern literature. Its relevance extends far beyond its South African context, offering a universal meditation on empire, justice, and human dignity.`,
    authorBio: `J.M. Coetzee is a South African-Australian novelist, essayist, and literary critic born in 1940 in Cape Town. He is one of the most celebrated writers of his generation, having won the Nobel Prize in Literature in 2003 and the Booker Prize twice, for Life & Times of Michael K and Disgrace.

Coetzee's novels often explore themes of oppression, moral conscience, and the human condition, frequently set against the backdrop of South African society. His spare, precise prose style and willingness to tackle difficult moral questions have earned him international acclaim. Other notable works include Foe, The Master of Petersburg, and the Jesus trilogy. He emigrated to Australia in 2002 and became an Australian citizen in 2006.`
  },
  {
    title: 'Born a Crime',
    author: 'Trevor Noah',
    publishDate: '2016-11-15',
    isbn10: '0399588191',
    isbn13: '978-0399588198',
    publisher: 'One World',
    pages: 304,
    realDimensions: '20.3 x 13.2 cm', // Based on research (8 x 5.2 inches)
    heightCm: 20.3,
    widthCm: 13.2,
    genre: 'Non-Fiction',
    subGenre: 'Autobiography',
    price: 29,
    description: `# Born a Crime by Trevor Noah

A powerful memoir that chronicles the comedian's extraordinary childhood in apartheid and post-apartheid South Africa, where his very existence was illegal. Born to a white Swiss father and a black Xhosa mother, Noah's birth violated the country's laws against interracial relationships, making him literally "born a crime."

Through a series of vividly told stories, Noah reveals how his mother's fierce love and determination shaped his worldview and survival instincts. The memoir balances humor with heartbreak as it explores themes of identity, racism, poverty, and resilience. Noah's unique perspective—caught between racial categories in a society obsessed with classification—provides profound insights into human nature and the absurdity of prejudice.

Winner of the 2017 Thurber Prize for American Humor and a #1 New York Times bestseller, Born a Crime showcases Noah's exceptional storytelling ability and his capacity to find humor in even the darkest circumstances. The book offers an unforgettable portrait of a young man coming of age in one of the world's most troubled societies.`,
    authorBio: `Trevor Noah is a South African comedian, television host, writer, and political commentator born in 1984 in Johannesburg. He became internationally known as the host of The Daily Show on Comedy Central from 2015 to 2022, taking over from Jon Stewart.

Noah began his career in South Africa as a comedian, radio host, and television presenter before moving to the United States. His mixed-race heritage and experiences growing up during apartheid have informed much of his comedy and writing. In addition to Born a Crime, he has released several comedy specials and continues to tour internationally as a stand-up comedian.`
  },
  {
    title: 'Nervous Conditions',
    author: 'Tsitsi Dangarembga',
    publishDate: '1988-01-01',
    isbn10: '0954702336',
    isbn13: '978-0954702335',
    publisher: 'Ayebia Clarke Publishing',
    pages: 224,
    realDimensions: '19.6 x 12.7 cm', // Based on research (7.7 x 5 inches)
    heightCm: 19.6,
    widthCm: 12.7,
    genre: 'Fiction',
    subGenre: 'Zimbabwean Literature',
    price: 27,
    description: `# Nervous Conditions by Tsitsi Dangarembga

A groundbreaking coming-of-age novel that follows Tambudzai, a young Shona girl determined to get an education despite the patriarchal constraints of her society. Set in colonial Rhodesia (now Zimbabwe) in the 1960s, the novel explores the complex intersections of gender, race, class, and colonial education.

When Tambu's brother dies, she gets the opportunity to attend the mission school, but the education comes at a cost—alienation from her family and traditional culture. Dangarembga masterfully portrays the psychological effects of colonialism and the particular challenges faced by African women caught between traditional expectations and modern aspirations.

The first novel published by a black woman from Zimbabwe in English, Nervous Conditions won the Commonwealth Writers' Prize in 1989 and has become a cornerstone of African feminist literature. The novel's exploration of the "nervous conditions" of colonial existence remains profoundly relevant today.`,
    authorBio: `Tsitsi Dangarembga is a Zimbabwean novelist, filmmaker, and playwright born in 1959 in Mutoko, Zimbabwe. She studied at Cambridge University and later became one of Zimbabwe's first female film directors, as well as one of the country's most prominent writers.

Dangarembga's works include the trilogy beginning with Nervous Conditions, followed by The Book of Not and This Mournable Body, which was longlisted for the Booker Prize in 2020. Her writing often explores themes of gender, colonialism, and postcolonial identity. She has received numerous awards for her contributions to literature and film, and continues to be an important voice in African feminist writing.`
  },
  {
    title: 'Broken Glass',
    author: 'Alain Mabanckou',
    publishDate: '2009-02-19',
    isbn10: '1846688159',
    isbn13: '978-1846688157',
    publisher: 'Profile Books',
    pages: 176,
    realDimensions: '19.8 x 13.5 cm', // Based on research
    heightCm: 19.8,
    widthCm: 13.5,
    genre: 'Fiction',
    subGenre: 'African Literature',
    price: 24,
    description: `# Broken Glass by Alain Mabanckou

A raucous and brilliant novel narrated by Broken Glass, the former school teacher turned barfly who has been commissioned to record the stories and lives of the other patrons of Credit Gone West, a bar in the Congo-Brazzaville. As Broken Glass documents the tales of his fellow drinkers, a vivid portrait emerges of a society navigating the aftermath of colonialism and the challenges of post-independence Africa.

Mabanckou's narrator is a masterful storyteller whose observations reveal both the humor and pathos of contemporary African life. Through his alcohol-soaked lens, we encounter characters struggling with corruption, poverty, and the clash between traditional values and modern realities. The novel's stream-of-consciousness style and dark humor create a unique voice in African literature.

Winner of the Prize of the Five Francophone Continents, Broken Glass showcases Mabanckou's exceptional ability to blend social commentary with literary innovation. The novel was selected as one of the 100 best books of the 21st century by The Guardian, cementing its place as a contemporary classic.`,
    authorBio: `Alain Mabanckou is a Franco-Congolese novelist, journalist, blogger, and academic born in 1966 in Congo-Brazzaville. He currently teaches Creative Writing at UCLA and is considered one of the most important contemporary francophone writers.

Mabanckou has published over twenty books, including novels, poetry collections, and essays. His works often explore themes of exile, identity, and the African diaspora experience. He has received numerous awards including the Prix Renaudot and has been translated into over fifteen languages. His other notable works include Black Bazaar, Memoirs of a Porcupine, and Tomorrow I'll Be Twenty.`
  },
  {
    title: 'The Beautiful Ones Are Not Yet Born',
    author: 'Ayi Kwei Armah',
    publishDate: '1969-01-01',
    isbn10: '0435900439',
    isbn13: '978-0435905408',
    publisher: 'Heinemann',
    pages: 183,
    realDimensions: '19.8 x 12.8 cm', // Standard Heinemann AWS format
    heightCm: 19.8,
    widthCm: 12.8,
    genre: 'Fiction',
    subGenre: 'Post-Colonial Literature',
    price: 26,
    description: `# The Beautiful Ones Are Not Yet Born by Ayi Kwei Armah

A powerful and unflinching portrait of post-independence Ghana, following an unnamed railway worker who struggles to maintain his integrity in a society riddled with corruption. Armah's debut novel captures the disillusionment that followed the optimism of Ghana's independence, presenting a stark vision of how quickly revolutionary ideals can decay.

The protagonist faces daily moral choices in a world where corruption has become the norm and honesty is seen as foolishness. Through vivid, sometimes brutal imagery, Armah explores themes of moral decay, social responsibility, and the individual's struggle against systemic corruption. The novel's unflinching realism and philosophical depth established it as a cornerstone of African literature.

Considered one of the most important African novels of the 20th century, The Beautiful Ones Are Not Yet Born influenced a generation of writers and readers with its honest examination of post-colonial African society. The book's relevance extends far beyond its Ghanaian setting, offering universal insights into power, corruption, and moral courage.`,
    authorBio: `Ayi Kwei Armah is a Ghanaian novelist born in 1939 in Takoradi, Ghana. He studied at Groton School, Harvard University, and Columbia University before returning to Africa to work as a journalist and teacher.

Armah's novels include Why Are We So Blest?, Two Thousand Seasons, and The Healers. His work often deals with themes of African history, colonialism, and post-independence disillusionment. He is known for his complex philosophical approach to literature and his commitment to presenting authentic African perspectives. Armah has lived in various countries including Algeria, Tanzania, and Senegal, and continues to be an influential voice in African literature.`
  },
  {
    title: 'Purple Hibiscus',
    author: 'Chimamanda Ngozi Adichie',
    publishDate: '2003-10-30',
    isbn10: '1616202416',
    isbn13: '978-1616202415',
    publisher: 'Algonquin Books',
    pages: 336,
    realDimensions: '20.6 x 13.7 cm', // Based on research (8.1 x 5.4 inches)
    heightCm: 20.6,
    widthCm: 13.7,
    genre: 'Fiction',
    subGenre: 'Coming-of-Age',
    price: 29,
    description: `# Purple Hibiscus by Chimamanda Ngozi Adichie

A stunning debut novel that follows fifteen-year-old Kambili and her privileged family in Nigeria as their carefully ordered world begins to crumble. Set against the backdrop of political turmoil and religious tension, the story explores the corrosive effects of authoritarianism both in the nation and within the family.

Kambili's father, Eugene, is both a generous benefactor to his community and a domestic tyrant whose religious extremism terrorizes his family. When Kambili and her brother visit their warm, unconventional Aunt Ifeoma, they discover a different way of being Nigerian, Catholic, and free. This awakening sets in motion a chain of events that will forever change their family.

Winner of the Commonwealth Writers' Prize for Best First Book and shortlisted for the Orange Prize, Purple Hibiscus established Adichie as one of the most important voices in contemporary literature. The novel's exploration of freedom, family, and faith resonates powerfully with readers worldwide, marking the arrival of a major literary talent.`,
    authorBio: `Chimamanda Ngozi Adichie is a Nigerian writer born in 1977 in Enugu, Nigeria. She studied medicine and pharmacy at the University of Nigeria before moving to the United States to study communications and creative writing.

Adichie's works include the novels Half of a Yellow Sun and Americanah, as well as the essay We Should All Be Feminists. She has received numerous awards including the MacArthur Fellowship and has been named one of Time magazine's 100 Most Influential People. Her TED talks have been viewed millions of times, and she continues to be a powerful voice on issues of race, gender, and identity.`
  },
  {
    title: "Burger's Daughter",
    author: 'Nadine Gordimer',
    publishDate: '1979-01-01',
    isbn10: '0140061932',
    isbn13: '978-0140061932',
    publisher: 'Penguin Books',
    pages: 368,
    realDimensions: '19.8 x 12.9 cm', // Standard Penguin format
    heightCm: 19.8,
    widthCm: 12.9,
    genre: 'Fiction',
    subGenre: 'Political Fiction',
    price: 31,
    description: `# Burger's Daughter by Nadine Gordimer

A profound exploration of personal identity and political commitment through the story of Rosa Burger, daughter of white Communist activists in apartheid South Africa. When her father dies in prison, Rosa must decide whether to continue his revolutionary legacy or forge her own path toward freedom.

Gordimer masterfully weaves together Rosa's personal journey with the broader struggle against apartheid, examining how political commitment shapes family relationships and individual identity. The novel follows Rosa from her youth in the shadow of her parents' activism through her escape to Europe and eventual return to South Africa, where she must confront her own responsibility to the struggle.

Banned in South Africa upon publication, Burger's Daughter won the CNA Literary Award and established Gordimer as one of the most important political novelists of her generation. The book's nuanced portrayal of white liberals in the anti-apartheid movement and its examination of the costs of political engagement remain remarkably relevant today.`,
    authorBio: `Nadine Gordimer was a South African writer born in 1923 in Springs, Gauteng. She became one of the most celebrated authors of the 20th century, winning the Nobel Prize in Literature in 1991 for her magnificent epic writing that has been of very great benefit to humanity.

Gordimer's novels include The Conservationist, July's People, and None to Accompany Me. Her work consistently examined the moral and psychological tensions of life under apartheid and its aftermath. She was actively involved in the anti-apartheid movement and her books were often banned in South Africa. She died in 2014, leaving behind a legacy as one of literature's most powerful voices for justice and human dignity.`
  },
  {
    title: 'The Conservationist',
    author: 'Nadine Gordimer',
    publishDate: '1974-01-01',
    isbn10: '0140043446',
    isbn13: '978-0140043440',
    publisher: 'Penguin Books',
    pages: 272,
    realDimensions: '19.8 x 12.9 cm', // Standard Penguin format
    heightCm: 19.8,
    widthCm: 12.9,
    genre: 'Fiction',
    subGenre: 'Political Fiction',
    price: 28,
    description: `# The Conservationist by Nadine Gordimer

A haunting novel about Mehring, a wealthy white industrialist who buys a farm as a weekend retreat, believing he can possess the land and control its history. When the body of an unknown black man is discovered on his property, Mehring's comfortable assumptions about ownership, belonging, and racial hierarchy begin to unravel.

Gordimer uses Mehring's weekend farm as a microcosm of white South Africa, exploring themes of guilt, alienation, and the impossibility of true possession in a land built on dispossession. The novel's stream-of-consciousness style and symbolic density create a powerful meditation on the psychology of apartheid and the inevitable consequences of injustice.

Winner of the joint Booker Prize in 1974, The Conservationist showcases Gordimer's exceptional ability to weave political and psychological insights into compelling narrative. The novel's prophetic vision of white South Africa's ultimate reckoning with its history makes it one of the most important works of South African literature.`,
    authorBio: `Nadine Gordimer was a South African writer born in 1923 in Springs, Gauteng. She became one of the most celebrated authors of the 20th century, winning the Nobel Prize in Literature in 1991 for her magnificent epic writing that has been of very great benefit to humanity.

Gordimer's novels include The Conservationist, July's People, and None to Accompany Me. Her work consistently examined the moral and psychological tensions of life under apartheid and its aftermath. She was actively involved in the anti-apartheid movement and her books were often banned in South Africa. She died in 2014, leaving behind a legacy as one of literature's most powerful voices for justice and human dignity.`
  },
  {
    title: "My Son's Story",
    author: 'Nadine Gordimer',
    publishDate: '1990-01-01',
    isbn10: '0140142819',
    isbn13: '978-0140142815',
    publisher: 'Penguin Books',
    pages: 288,
    realDimensions: '19.8 x 12.9 cm', // Standard Penguin format
    heightCm: 19.8,
    widthCm: 12.9,
    genre: 'Fiction',
    subGenre: 'Political Fiction',
    price: 27,
    description: `# My Son's Story by Nadine Gordimer

A complex family drama set against the backdrop of apartheid's final years, told through the eyes of Will, a young man discovering his father's affair with a white human rights lawyer. As the anti-apartheid movement intensifies, family loyalties and political commitments collide in devastating ways.

Sonny, Will's father, transforms from a schoolteacher into a political activist, but his personal life becomes entangled with his political activities when he begins an affair with Hannah, his lawyer. Gordimer explores how political struggle can both unite and destroy families, examining the personal costs of resistance and the complex relationships that transcend racial boundaries.

The novel offers a nuanced portrayal of the final phase of apartheid, when the system was beginning to crack but racial divisions remained deeply entrenched. Gordimer's masterful characterization and psychological insight create a powerful story about love, betrayal, and the price of political engagement in a morally complex world.`,
    authorBio: `Nadine Gordimer was a South African writer born in 1923 in Springs, Gauteng. She became one of the most celebrated authors of the 20th century, winning the Nobel Prize in Literature in 1991 for her magnificent epic writing that has been of very great benefit to humanity.

Gordimer's novels include The Conservationist, July's People, and None to Accompany Me. Her work consistently examined the moral and psychological tensions of life under apartheid and its aftermath. She was actively involved in the anti-apartheid movement and her books were often banned in South Africa. She died in 2014, leaving behind a legacy as one of literature's most powerful voices for justice and human dignity.`
  },
  {
    title: 'The Book of Not',
    author: 'Tsitsi Dangarembga',
    publishDate: '2006-01-01',
    isbn10: '0954702360',
    isbn13: '978-0954702366',
    publisher: 'Ayebia Clarke Publishing',
    pages: 248,
    realDimensions: '19.6 x 12.7 cm', // Same format as Nervous Conditions
    heightCm: 19.6,
    widthCm: 12.7,
    genre: 'Fiction',
    subGenre: 'Zimbabwean Literature',
    price: 28,
    description: `# The Book of Not by Tsitsi Dangarembga

The powerful sequel to Nervous Conditions, following Tambudzai as she continues her education at a prestigious Catholic boarding school. As she navigates the complex racial and social hierarchies of colonial Rhodesia, Tambu struggles with questions of identity, belonging, and the cost of assimilation.

At Sacred Heart, Tambu encounters both opportunities and humiliations as she tries to excel academically while maintaining her sense of self. The novel explores the psychological violence of colonial education and the ways in which internalized racism can damage even the most promising young minds. Dangarembga's nuanced portrayal shows how colonial systems attempted to create subjects who would police themselves.

The Book of Not deepens the themes begun in Nervous Conditions, examining how colonial education promised liberation while simultaneously demanding the abandonment of African identity. The novel's title reflects Tambu's growing awareness of all the things she is told she is "not" – not white, not worthy, not beautiful – and her struggle to define herself beyond these negations.`,
    authorBio: `Tsitsi Dangarembga is a Zimbabwean novelist, filmmaker, and playwright born in 1959 in Mutoko, Zimbabwe. She studied at Cambridge University and later became one of Zimbabwe's first female film directors, as well as one of the country's most prominent writers.

Dangarembga's works include the trilogy beginning with Nervous Conditions, followed by The Book of Not and This Mournable Body, which was longlisted for the Booker Prize in 2020. Her writing often explores themes of gender, colonialism, and postcolonial identity. She has received numerous awards for her contributions to literature and film, and continues to be an important voice in African feminist writing.`
  },
  {
    title: 'Coconut',
    author: 'Kopano Matlwa',
    publishDate: '2007-01-01',
    isbn10: '1770100849',
    isbn13: '978-1770100848',
    publisher: 'Jacana Media',
    pages: 170,
    realDimensions: '21 x 14.8 cm', // Standard South African format
    heightCm: 21,
    widthCm: 14.8,
    genre: 'Fiction',
    subGenre: 'Contemporary South African Literature',
    price: 25,
    description: `# Coconut by Kopano Matlwa

A sharp and satirical examination of post-apartheid South Africa's black middle class through the stories of two young women navigating racial identity and social expectations. The novel's title refers to the derogatory term for black people who are seen as "black on the outside, white on the inside."

The first part follows Ofilwe, a privileged teenager who attends a formerly white school and struggles with questions of authenticity and belonging. The second part tells the story of Fikile, a university student from Soweto who feels pressure to conform to middle-class expectations while maintaining her roots in township culture.

Matlwa's debut novel offers a bold critique of the "Born Free" generation and the complexities of racial identity in democratic South Africa. Written when the author was just 21, Coconut provides an insider's perspective on the challenges facing young black South Africans as they navigate between different worlds and expectations.`,
    authorBio: `Kopano Matlwa is a South African writer and medical doctor born in 1985 in Soweto. She wrote Coconut while studying medicine at the University of Cape Town, making her one of the youngest published novelists in South Africa.

Matlwa's work often explores themes of identity, race, and class in post-apartheid South Africa. Her second novel, Spilt Milk, was published in 2010. In addition to her writing career, she works as a psychiatrist and continues to examine the psychological impact of social and economic inequality. She has been recognized as one of the most promising voices in contemporary South African literature.`
  },
  {
    title: 'The Pickup',
    author: 'Nadine Gordimer',
    publishDate: '2001-01-01',
    isbn10: '0140296298',
    isbn13: '978-0140296297',
    publisher: 'Penguin Books',
    pages: 288,
    realDimensions: '19.8 x 12.9 cm', // Standard Penguin format
    heightCm: 19.8,
    widthCm: 12.9,
    genre: 'Fiction',
    subGenre: 'Contemporary Fiction',
    price: 26,
    description: `# The Pickup by Nadine Gordimer

A profound exploration of love, identity, and belonging across racial and cultural divides, following Julie Summers, a wealthy white South African, and Ibrahim, an illegal immigrant from an unnamed Arab country. When Ibrahim's car breaks down in Johannesburg, their chance encounter evolves into a complex relationship that challenges both their assumptions about themselves and each other.

As immigration authorities close in on Ibrahim, the couple flees to his homeland, where Julie must confront her privileged expectations and adapt to a world completely different from her own. Gordimer masterfully examines themes of displacement, economic inequality, and the search for authentic connection in an increasingly globalized world.

Longlisted for the Booker Prize, The Pickup demonstrates Gordimer's continued relevance in the post-apartheid era, addressing contemporary issues of migration, globalization, and cross-cultural relationships. The novel's exploration of how love can transcend cultural barriers while highlighting persistent inequalities makes it essential reading for understanding modern South Africa's place in the world.`,
    authorBio: `Nadine Gordimer was a South African writer born in 1923 in Springs, Gauteng. She became one of the most celebrated authors of the 20th century, winning the Nobel Prize in Literature in 1991 for her magnificent epic writing that has been of very great benefit to humanity.

Gordimer's novels include The Conservationist, July's People, and None to Accompany Me. Her work consistently examined the moral and psychological tensions of life under apartheid and its aftermath. She was actively involved in the anti-apartheid movement and her books were often banned in South Africa. She died in 2014, leaving behind a legacy as one of literature's most powerful voices for justice and human dignity.`
  },
  {
    title: 'Age of Iron',
    author: 'J.M. Coetzee',
    publishDate: '1990-01-01',
    isbn10: '0140139400',
    isbn13: '978-0140139402',
    publisher: 'Penguin Books',
    pages: 224,
    realDimensions: '19.8 x 12.9 cm', // Standard Penguin format
    heightCm: 19.8,
    widthCm: 12.9,
    genre: 'Fiction',
    subGenre: 'Political Fiction',
    price: 27,
    description: `# Age of Iron by J.M. Coetzee

A devastating novel in the form of a letter from Elizabeth Curren, a retired classics professor dying of cancer, to her daughter in America. Set in Cape Town during the final years of apartheid, the novel confronts the moral bankruptcy of white South African society through the eyes of a woman facing her own mortality.

As Mrs. Curren witnesses the violence and brutality of the apartheid state's final desperate attempts to maintain control, she is forced to confront her own complicity in the system. Her relationship with Vercueil, a homeless man who appears in her garden, becomes a metaphor for the complex relationships between the privileged and dispossessed in South African society.

Coetzee's searing prose captures both personal and political disintegration with unflinching honesty. Age of Iron stands as one of the most powerful indictments of apartheid ever written, combining intimate personal tragedy with sweeping social criticism to create a work of devastating moral clarity.`,
    authorBio: `J.M. Coetzee is a South African-Australian novelist, essayist, and literary critic born in 1940 in Cape Town. He is one of the most celebrated writers of his generation, having won the Nobel Prize in Literature in 2003 and the Booker Prize twice, for Life & Times of Michael K and Disgrace.

Coetzee's novels often explore themes of oppression, moral conscience, and the human condition, frequently set against the backdrop of South African society. His spare, precise prose style and willingness to tackle difficult moral questions have earned him international acclaim. Other notable works include Foe, The Master of Petersburg, and the Jesus trilogy. He emigrated to Australia in 2002 and became an Australian citizen in 2006.`
  }
]

// Function to find or create author
async function findOrCreateAuthor(environment, authorName, authorBio) {
  try {
    const existingAuthors = await environment.getEntries({
      content_type: 'author',
      'fields.fullName': authorName
    })
    
    if (existingAuthors.items.length > 0) {
      console.log(`📝 Found existing author: ${authorName}`)
      return existingAuthors.items[0]
    }
    
    console.log(`👤 Creating author: ${authorName}`)
    const authorEntry = await environment.createEntry('author', {
      fields: {
        fullName: { 'en-US': authorName },
        biography: { 'en-US': authorBio },
        links: []
      }
    })
    await authorEntry.publish()
    return authorEntry
  } catch (error) {
    console.error(`❌ Error with author ${authorName}:`, error.message)
    throw error
  }
}

// Function to find or create genre
async function findOrCreateGenre(environment, genre, subGenre) {
  try {
    const existingGenres = await environment.getEntries({
      content_type: 'genre',
      'fields.genre': genre,
      'fields.subGenre': subGenre
    })
    
    if (existingGenres.items.length > 0) {
      console.log(`📝 Found existing genre: ${genre} - ${subGenre}`)
      return existingGenres.items[0]
    }
    
    console.log(`🏷️ Creating genre: ${genre} - ${subGenre}`)
    const genreEntry = await environment.createEntry('genre', {
      fields: {
        genre: { 'en-US': genre },
        subGenre: { 'en-US': subGenre }
      }
    })
    await genreEntry.publish()
    return genreEntry
  } catch (error) {
    console.error(`❌ Error with genre ${genre} - ${subGenre}:`, error.message)
    throw error
  }
}

// Function to create price entry
async function createPrice(environment, bookData) {
  try {
    console.log(`💰 Creating price: R${bookData.price}`)
    const priceEntry = await environment.createEntry('price', {
      fields: {
        text: { 'en-US': 'Paperback' },
        price: { 'en-US': bookData.price },
        isNew: { 'en-US': false },
        description: { 'en-US': `The paperback edition of ${bookData.title} in excellent condition.` },
        productInformation: {
          'en-US': {
            isbn10: bookData.isbn10,
            isbn13: bookData.isbn13,
            language: 'English',
            dimensions: bookData.realDimensions,
            printLength: `${bookData.pages} pages`,
            publisher: bookData.publisher,
            publicationDate: bookData.publishDate
          }
        }
      }
    })
    await priceEntry.publish()
    return priceEntry
  } catch (error) {
    console.error(`❌ Error creating price for ${bookData.title}:`, error.message)
    throw error
  }
}

// Function to get texture assets
async function getTextureAssets(environment, size) {
  try {
    const assets = sizeMapping[size]
    if (!assets) {
      throw new Error(`No texture assets found for size: ${size}`)
    }
    
    const frontAsset = await environment.getAsset(assets.front)
    const sideAsset = await environment.getAsset(assets.side)
    
    return { frontAsset, sideAsset }
  } catch (error) {
    console.error(`❌ Error getting texture assets for size ${size}:`, error.message)
    throw error
  }
}

// Function to create book entry
async function createBook(environment, bookData) {
  try {
    console.log(`\n📚 Creating "${bookData.title}" by ${bookData.author}`)
    
    // 1. Create or find author
    const authorEntry = await findOrCreateAuthor(environment, bookData.author, bookData.authorBio)
    
    // 2. Create or find genre
    const genreEntry = await findOrCreateGenre(environment, bookData.genre, bookData.subGenre)
    
    // 3. Create price entry
    const priceEntry = await createPrice(environment, bookData)
    
    // 4. Determine size and get texture assets
    const size = mapDimensionsToSize(bookData.heightCm, bookData.widthCm)
    const { frontAsset, sideAsset } = await getTextureAssets(environment, size)
    
    console.log(`📏 Size: ${size} (${bookData.realDimensions})`)
    
    // 5. Create the main book entry
    console.log(`📖 Creating main book entry`)
    const bookFields = {
      title: { 'en-US': bookData.title },
      featured: { 'en-US': false },
      description: { 'en-US': bookData.description },
      authors: { 
        'en-US': [{
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: authorEntry.sys.id
          }
        }]
      },
      publishDate: { 'en-US': bookData.publishDate },
      genre: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry', 
            id: genreEntry.sys.id
          }
        }
      },
      prices: {
        'en-US': [{
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: priceEntry.sys.id
          }
        }]
      },
      bookSize: { 'en-US': size },
      bookCoverTextureFront: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: frontAsset.sys.id
          }
        }
      },
      bookCoverTextureSide: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: sideAsset.sys.id
          }
        }
      }
    }
    
    const bookEntry = await environment.createEntry('book', { fields: bookFields })
    const publishedBook = await bookEntry.publish()
    
    console.log(`✅ Successfully created "${bookData.title}"`)
    console.log(`   Book ID: ${publishedBook.sys.id}`)
    console.log(`   Author ID: ${authorEntry.sys.id}`)
    console.log(`   Genre ID: ${genreEntry.sys.id}`)
    console.log(`   Price ID: ${priceEntry.sys.id}`)
    console.log(`   Size: ${size}`)
    
    return {
      success: true,
      bookId: publishedBook.sys.id,
      linkedEntries: {
        authorId: authorEntry.sys.id,
        genreId: genreEntry.sys.id,
        priceIds: [priceEntry.sys.id],
        linkIds: []
      },
      metadata: {
        researchedSize: size,
        realDimensions: bookData.realDimensions,
        textureAssets: [frontAsset.sys.id, sideAsset.sys.id]
      },
      errors: []
    }
    
  } catch (error) {
    console.error(`❌ Failed to create "${bookData.title}":`, error.message)
    return {
      success: false,
      bookId: null,
      linkedEntries: {},
      metadata: {},
      errors: [error.message]
    }
  }
}

// Main function to create all books
async function createAfricanLiteratureCollection() {
  console.log('🌍 Creating African Literature Collection for Contentful')
  console.log('=' .repeat(60))
  
  try {
    const environment = await getEnvironment()
    const results = []
    
    for (const bookData of booksData) {
      try {
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const result = await createBook(environment, bookData)
        results.push(result)
        
      } catch (error) {
        console.error(`❌ Error processing ${bookData.title}:`, error.message)
        results.push({
          success: false,
          bookId: null,
          linkedEntries: {},
          metadata: {},
          errors: [error.message]
        })
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60))
    console.log('📊 CREATION SUMMARY')
    console.log('=' .repeat(60))
    
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log(`✅ Successfully created: ${successful.length} books`)
    console.log(`❌ Failed to create: ${failed.length} books`)
    
    if (successful.length > 0) {
      console.log('\n📚 Successfully Created Books:')
      successful.forEach((result, index) => {
        const book = booksData[results.indexOf(result)]
        console.log(`   ${index + 1}. ${book.title} by ${book.author}`)
        console.log(`      Book ID: ${result.bookId}`)
        console.log(`      Size: ${result.metadata.researchedSize}`)
      })
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Books:')
      failed.forEach((result, index) => {
        const book = booksData[results.indexOf(result)]
        console.log(`   ${index + 1}. ${book.title} by ${book.author}`)
        console.log(`      Error: ${result.errors.join(', ')}`)
      })
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    throw error
  }
}

// Run the script
if (require.main === module) {
  createAfricanLiteratureCollection()
    .then(() => {
      console.log('\n🎉 African Literature Collection creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { createAfricanLiteratureCollection, booksData, mapDimensionsToSize }