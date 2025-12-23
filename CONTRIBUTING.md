# Contributing to TaskWarrior UI

Thank you for your interest in contributing to TaskWarrior UI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Check existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Operating system and version
   - Node.js and npm versions
   - TaskWarrior version
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. **Open a feature request** issue
2. **Describe the feature** in detail
3. **Explain the use case** and benefits
4. **Consider implementation** complexity

### Code Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YourUsername/taskwarrior-ui.git
   cd taskwarrior-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

#### Development Guidelines

**Code Style:**
- Follow existing code formatting and style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

**React Components:**
- Use functional components with hooks
- Follow React best practices
- Ensure components are reusable when possible
- Add PropTypes or TypeScript types

**API Development:**
- Follow RESTful conventions
- Add proper error handling
- Validate input parameters
- Document new endpoints

**Testing:**
- Add tests for new features
- Ensure existing tests pass
- Test on multiple browsers/devices
- Verify TaskWarrior integration works

#### Commit Guidelines

Use conventional commit messages:

```
type(scope): description

Examples:
feat(ui): add task filtering functionality
fix(api): resolve task completion issue
docs(readme): update installation instructions
style(ui): improve mobile responsiveness
refactor(api): optimize task retrieval logic
test(ui): add component unit tests
```

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** if applicable
5. **Create pull request** with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing instructions

## 🏗️ Project Structure

```
taskwarrior-ui/
├── public/                 # Static files
│   ├── index.html         # Main HTML template
│   └── favicon.ico        # App icon
├── src/                   # React source code
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── App.js            # Main App component
│   └── index.js          # React entry point
├── server.js             # Express API server
├── package.json          # Dependencies and scripts
├── README.md            # Project documentation
├── LICENSE              # MIT license
└── AUTHORS.md           # Contributors list
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Testing Guidelines

- Write unit tests for components
- Test API endpoints thoroughly
- Include edge cases and error scenarios
- Mock external dependencies (TaskWarrior CLI)
- Test responsive design on different screen sizes

## 📝 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Keep comments up to date

### User Documentation

- Update README.md for new features
- Add setup instructions for new requirements
- Include troubleshooting information
- Provide API documentation for new endpoints

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

1. Update version in `package.json`
2. Update `RELEASE_NOTES.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release
6. Update documentation if needed

## 🎯 Development Priorities

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Security enhancements
- Mobile experience improvements

### Medium Priority
- New features and functionality
- UI/UX enhancements
- Additional TaskWarrior integrations
- Developer experience improvements

### Low Priority
- Code refactoring
- Documentation improvements
- Build process optimizations
- Nice-to-have features

## 💬 Communication

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Email** - Contact maintainer directly for sensitive issues

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## 🏆 Recognition

Contributors will be:
- Added to the AUTHORS.md file
- Mentioned in release notes
- Recognized in the project README
- Invited to join the maintainers team (for significant contributions)

## 📄 License

By contributing to TaskWarrior UI, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TaskWarrior UI! 🎉
