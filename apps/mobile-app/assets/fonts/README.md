# Fonts Directory

Place all font files here.

## Required Fonts

- `Cairo-Regular.ttf`
- `Cairo-Bold.ttf`
- `Cairo-SemiBold.ttf`
- `Cairo-Medium.ttf`

## Font Usage

Fonts are configured in `pubspec.yaml`:

```yaml
fonts:
  - family: Cairo
    fonts:
      - asset: assets/fonts/Cairo-Regular.ttf
      - asset: assets/fonts/Cairo-Bold.ttf
        weight: 700
      - asset: assets/fonts/Cairo-SemiBold.ttf
        weight: 600
      - asset: assets/fonts/Cairo-Medium.ttf
        weight: 500
```



