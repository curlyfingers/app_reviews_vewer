package config

type Settings struct {
	Port       int
	Host       string
	DBFileName string
}

func Load() (Settings, error) {
	s := loadDefaults()
	return s, nil
}

func loadDefaults() Settings {
	return Settings{
		Host:       "localhost",
		Port:       8080,
		DBFileName: "app_reviews.db",
	}
}
