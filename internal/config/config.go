package config

type Settings struct {
	Port int
	Host string
}

func Load() (Settings, error) {
	s := loadDefaults()
	return s, nil
}

func loadDefaults() Settings {
	return Settings{
		Host: "localhost",
		Port: 8080,
	}
}
