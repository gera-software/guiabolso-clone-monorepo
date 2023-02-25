module.exports = {
	roots: ["<rootDir>/test"],
	clearMocks: true,
	coverageDirectory: "coverage",
	coverageProvider: "v8",
	collectCoverageFrom: [
		"<rootDir>/src/**/*.ts",
		"!**/test/**",
		"!**/config/**"
	],
	testEnvironment: "node",
	transform: {
		".+\\.ts$": "ts-jest",
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@test/(.*)$": "<rootDir>/test/$1"
	}
}