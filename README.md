# Embedded Systems — Zero to Hero

A free, hands-on entry-level embedded systems course. Covers basic electronics, Arduino, ESP32, sensors, and real projects.

**Live site:** <https://classyvaibhav.github.io/embedded-course/>

## What's Inside

- **[Course Notes](notes/index.html)** — 12 self-paced lessons with Tinkercad and Wokwi simulator exercises. Zero-to-hero pacing, quiz questions, capstone project.
- **[Teaching Guide](teaching/index.html)** — 35 topic cards with session scripts, worked examples, gotcha callouts, and check-questions for instructors mentoring someone through the curriculum.
- **[Career Plan](career_plan.html)** — 10-week roadmap to land an Embedded Systems Trainee role in India.

## Curriculum

| # | Lesson | Topics |
|---|---|---|
| 1 | Electricity Basics & Ohm's Law | V, I, R, P; first LED circuit |
| 2 | Resistors, Caps, Voltage Dividers | Colour codes, RC, level-shifting |
| 3 | Diodes, LEDs, Transistors | Forward bias, BJT/MOSFET switches |
| 4 | Op-Amps | Golden rules, four configs |
| 5 | What is Embedded? | MCU vs MPU, memory, boot process |
| 6 | First Arduino Blink | Install IDE, upload sketch |
| 7 | GPIO | Buttons, INPUT_PULLUP |
| 8 | ADC & PWM | Potentiometer read, LED fade |
| 9 | Serial, I2C, SPI | Communication protocols |
| 10 | Interrupts & Non-Blocking Code | ISRs, millis(), debouncing |
| 11 | Real Project | ESP32 + DHT22 + BMP280 + OLED sensor hub |
| 12 | Where to Go Next | Jobs, certifications, interview prep |

## Simulator-Friendly

Every lesson includes a "Try It Live" section with direct links to pre-built projects on:
- [Tinkercad Circuits](https://www.tinkercad.com/circuits) — best for Arduino beginners
- [Wokwi](https://wokwi.com/) — best for ESP32

You don't need hardware to get started. Buy the kit (~₹1,800 on [Robu.in](https://robu.in/)) when you're ready to build on real boards.

## Hardware Kit

Shopping list for the full course (one-time, ~₹1,800):

- ESP32 DevKit v1
- Arduino Uno R3
- Breadboard + jumper wires
- Component assortment (resistors, capacitors, LEDs)
- Sensors: DHT22, BMP280, 0.96" OLED (I2C), MPU6050
- Transistors: 2N2222 (NPN), IRLZ44N (logic-level N-MOSFET)
- Op-amp: LM358
- Push buttons, potentiometer

## Running Locally

This is a pure static HTML/CSS site — no build step, no dependencies.

```bash
git clone git@github.com:classyvaibhav/embedded-course.git
cd embedded-course
# Open index.html in any browser, or:
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Contributing

Found a typo, a diagram that could be clearer, or a concept explained wrong? PRs welcome. Please keep the pedagogy:

- Build first, explain second
- One concept per lesson
- Link to simulators (Tinkercad or Wokwi)
- Callouts for common mistakes
- Check-questions with answers

## License

MIT License — use, modify, redistribute freely.

---

Built and maintained by [@classyvaibhav](https://github.com/classyvaibhav).
