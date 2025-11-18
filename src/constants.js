// SERVER CONFIGURATION
export const SERVER = {
    PORT: 3000,
    HOST: 'localhost'
};

// DATABASE CONFIGURATION  
export const DATABASE = {
    URI: 'mongodb://localhost:27017',
    NAME: 'cinemateca'
};

// UPLOAD PATHS
export const PATHS = {
    UPLOADS_BASE: 'uploads',
    MOVIE_POSTERS: 'moviePosters',
    ACTORS: 'actorPortraits',
    
    // Computed paths
    get UPLOADS_BASE_FULL() {
        return this.UPLOADS_BASE + '/';
    },
    get MOVIE_POSTERS_FULL() {
        return this.UPLOADS_BASE + '/' + this.MOVIE_POSTERS + '/';
    },
    get ACTORS_FULL() {
        return this.UPLOADS_BASE + '/' + this.ACTORS + '/';
    }
};

// PAGINATION SETTINGS
export const PAGINATION = {
    MOVIES_PER_PAGE: 6,
    MAX_PAGINATION_BUTTONS: 3
};

// VALIDATION RULES
export const VALIDATION = {
    DESCRIPTION: {
        MIN_LENGTH: 50,
        MAX_LENGTH: 1000
    },
    DATES: {
        MIN_YEAR: 1888,          // First ever movie
        ACTOR_MIN_YEAR: 1900,    // Reasonable birth year for actors
        get MAX_YEAR() {
            return new Date().getFullYear() + 5;
        },
        get ACTOR_MAX_YEAR() {
            return new Date().getFullYear() + 1;
        },
        get CURRENT_YEAR() {
            return new Date().getFullYear();
        }
    }
};

// MOVIE DATA CONSTANTS
export const AGE_RATINGS = ['A', '7', '12', '16', '18'];

export const GENRES = [
    'Action',
    'Adventure', 
    'Animation',
    'Biography',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'Film Noir',
    'History',
    'Horror',
    'Music',
    'Musical',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Short Film',
    'Sport',
    'Superhero',
    'Thriller',
    'War',
    'Western'
];

export const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
    'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
    'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
    'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia',
    'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China',
    'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt',
    'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland',
    'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
    'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
    'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan',
    'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kosovo', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
    'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
    'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway',
    'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
    'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
    'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
    'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'UK', 'USA',
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia',
    'Zimbabwe'
];