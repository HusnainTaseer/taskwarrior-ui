# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Task filtering and advanced search functionality
- Bulk task operations
- Task templates system
- Export/import functionality
- Enhanced mobile experience
- Plugin system for extensions

## [1.1.3] - 2026-09-01

### Fixed
- Corrected inverted field labels to match TaskWarrior's data model. The
  required one-line field is now labeled "Description" and the optional
  attached note is labeled "Annotation" (previously these were swapped):
  - Add-task "Task title..." placeholder → "Task description..."
  - Add-task "Task description (optional)..." placeholder → "Annotation (optional)..."
  - Task detail view heading "Description" → "Annotation"
  ([#1](https://github.com/HusnainTaseer/taskwarrior-ui/issues/1))

### Changed
- Refreshed the README screenshot to reflect the corrected labels; it is now
  tracked in-repo at `docs/screenshot.png` and referenced by a relative path.

## [1.0.0] - 2024-12-23

### Added
- Initial release of TaskWarrior UI
- Modern React-based web interface
- Complete task management functionality (create, edit, complete, reopen)
- Project and priority support
- Tag management system
- Task annotations and notes
- REST API server with Express.js
- Real-time task synchronization
- Mobile-responsive design
- Comprehensive documentation
- MIT license
- Semantic versioning implementation
- Development and production build scripts

### Technical Details
- React 19.2.3 frontend
- Express 5.2.1 API server
- Direct TaskWarrior CLI integration
- CORS support for cross-origin requests
- Comprehensive error handling
- Node.js 16+ and npm 8+ support

### Documentation
- Detailed README with installation instructions
- TaskWarrior setup guide for macOS and Linux
- API documentation
- Contributing guidelines
- Release notes
- Authors and license information

---

## Version History

- **1.0.0** - Initial stable release with core functionality
- **Future versions** - Will follow semantic versioning (MAJOR.MINOR.PATCH)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
