import React, {Component} from 'react'
import './App.css'
import Lottie from 'react-lottie'

const SpeechRecognition = SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const words = [
    'hello',
    'hi',
    'thank you',
    'thanks',
    'cheers',
    'shit',
    'fuck',
    'yes',
    'sure',
    'no',
    'number one',
    'number two',
    'one',
    'two',
    'love you',
    'apple',
    'ginger',
    'beer'
];
const grammar = `#JSGF V1.0; grammar words; public <word> = ${words.join(' | ')} ;`;
const speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);

const recognition = new SpeechRecognition();
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'en-US';
// recognition.interimResults = false;
recognition.interimResults = true;
recognition.maxAlternatives = 1;

const synth = window.speechSynthesis;

class App extends Component {

    state = {
        shouldBeListening: true,
        isListening: false,
        status: 'hello', // hello | drink? | choice | fill
        // status: 'choice', // hello | drink? | choice | fill
    };

    sorryTimeout = null;

    componentDidMount() {
        recognition.onresult = (event) => {
            const word = event.results[event.results.length - 1][0].transcript;

            console.log("Result:", word);

            // if (!this.state.shouldBeListening || synth.speaking || synth.pending) {
            if (synth.speaking || synth.pending) {
                console.log("Abort", synth.speaking, synth.pending);

                recognition.abort();

                return
            }

            this.artificialIntelligence(word.toLowerCase())
        };

        recognition.onspeechstart = () => console.log('Speech start');
        recognition.onspeechend = () => console.log('Speech end');
        recognition.onaudiostart = () => {
            // console.log("Audio start")
            this.setState({isListening: true});
        };
        recognition.onaudioend = () => {
            // console.log("Audio end")
            this.setState({isListening: false});
        };

        setInterval(() => {
            try {
                if (this.state.shouldBeListening) {
                    this.startListening();
                } else {
                    this.stopListening();
                }
            } catch (e) {
            }
        }, 100);
    }

    startListening = () => {
        if (this.state.isListening) {
            // console.log("Already listening");
            return;
        }

        try {
            // console.log("Start listening");

            recognition.start();
        } catch (e) {
            // console.log("Already started");
        }
    };

    stopListening = () => {
        if (!this.state.isListening) {
            // console.log("Not listening");
            return;
        }

        try {
            console.log("Stop listening");

            recognition.stop();
        } catch (e) {
            // console.log("Already stopped");
        }
    };

    artificialIntelligence = word => {
        const {status} = this.state;

        this.setListening(false);

        if (status === 'hello') {
            if (
                word.includes('hello') ||
                word.includes('hi')
            ) {
                this.hello()
            }
        } else if (status === 'drink?') {
            if (
                word.includes('yes') ||
                word.includes('yeah') ||
                word.includes('sure') ||
                word.includes('please')
            ) {
                this.chooseDrink()
            } else if (word.includes('no')) {
                this.cancel()
            }
        } else if (status === 'choice') {
            if (
                word.includes(1) ||
                word.includes('one') ||
                word.includes('sangria') ||
                word.includes('christmas')
            ) {
                this.fixDrink(1)
            } else if (
                word.includes(2) ||
                word.includes('apple') ||
                word.includes('beer') ||
                word.includes('ginger') ||
                word.includes('two')
            ) {
                this.fixDrink(2)
            } else if (word.includes('nothing')) {
                this.cancel()
            } else {
                this.sorry();
            }
        }

        if (
            word.includes('thank') ||
            word.includes('thanks') ||
            word.includes('cheers')
        ) {
            this.say('Oh... you are so welcome')
        } else if (word.includes('love you')) {
            this.say('I love you, too. Or then I am just drunk in love.')
        } else if (word.includes("what's up")) {
            this.say("Not much. Which one of us do you think is more drunk?")
        } else if (word.includes('shut up')) {
            this.say("R u d e, rude. I can't shut up but I can be shut down.");
        }
        else if (word.includes('*')) {
            this.say('Mind your language, would you!')
        }

        setTimeout(() => this.setListening(true), 1)
    };

    hello = () => {
        this.say('Hello there! ...', () => {
            this.say('Can I fix you a drink?', () => {
                this.setState({status: 'drink?'}, () => {
                    this.setListening(true);
                })
            });
        });
    };

    cancel = () => {
        this.say('Ok, well, another time then');

        this.setState({status: 'hello'})
    };

    chooseDrink = () => {
        this.say('Got it! Take a look at the drink list. Let me know what you want.', () => {
            this.setListening(true);
        });

        this.setState({status: 'choice'})
    };

    fixDrink = (choice) => {
        const drinks = {
            1: 'Christmas sangria',
            2: 'Apple ginger beer'
        };

        this.say(`Excellent choice!`, () => {
            this.say(`One ${drinks[choice]}, coming right up!`, () => {
                this.setState({status: 'fill'});

                const oReq = new XMLHttpRequest();
                oReq.open("GET", "http://localhost:5000");
                oReq.send();

                setTimeout(() => {
                    this.say('All done! Enjoy your evening with your increased alcohol level in your blood', () => {
                        this.setState({status: 'done'});

                        setTimeout(() => this.setState({status: 'hello'}), 8000)
                    });

                }, 2000)
            });
        });

    };

    say = (what, onEnd) => {
        this.setListening(false);
        this.clearSorry();

        const utterance = new SpeechSynthesisUtterance(what);
        utterance.pitch = 1.2;
        // utterance.rate = 0.9;
        utterance.rate = 1.6;
        utterance.volume = 1;
        utterance.lang = 'en-US';

        if (onEnd) {
            utterance.onend = () => {
                console.log("SAID:", what);

                this.setListening(true);

                onEnd();
            };
        }

        synth.speak(utterance)
    };

    clearSorry = () => {
        if (this.sorryTimeout) {
            clearTimeout(this.sorryTimeout);
        }
    };

    sorry = () => {
        this.clearSorry();

        const sorrys = [
            'Sorry - come again?',
            'I beg your pardon?',
            'What was that?',
            'Could you please repeat that?',
            "I'm not sure I heard you right?",
        ];

        this.sorryTimeout = setTimeout(() => {
            this.say(sorrys[new Date().getSeconds() % sorrys.length], () => {
                this.setListening(true);
            })
        }, 400);
    };

    setListening = shouldListen => {
        this.setState({shouldBeListening: shouldListen})
    };

    render() {
        const {status} = this.state;

        const done = {
            loop: true,
            autoplay: true,
            animationData: require('./thirsty'),
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };

        const fill = {
            ...done,
            animationData: require('./loader'),
        };

        const idle = {
            ...done,
            animationData: require('./soda_loader'),
        };

        const listening = {
            ...done,
            animationData: require('./ripple_loading_animation'),
        };

        return (
            <div className="App">
                {status === 'hello' && <div>
                    <Lottie
                        options={idle}
                        height={400}
                        width={400}
                    />

                    <div className="sub">
                        Want me to fix you a drink? <br/>Just say <i>hello</i>.
                    </div>
                </div>}

                {status === 'drink?' && <div>
                    <Lottie
                        options={idle}
                        height={400}
                        width={400}
                    />

                    Yes / No
                </div>}

                {status === 'choice' && <div>
                    <div className="cards">
                        <div className="card">
                            <h1>1</h1>

                            <h2>Christmas sangria</h2>

                            <div className="sub">Seasonal favorite.</div>
                        </div>

                        <div style={{flex: 0.2}}></div>

                        <div className="card">
                            <h1>2</h1>

                            <h2>Apple ginger beer</h2>

                            <div className="sub">Summer in winter.</div>
                        </div>
                    </div>

                    <div className="sub">
                        Place your glass on the designated target.<br/>
                        Choose a drink by saying it's number.<br/>
                    </div>
                </div>}

                {status === 'fill' && <div>
                    <Lottie
                        options={fill}
                        height={600}
                        width={600}
                    />

                    <div className="sub">
                        Please have your glass on the designated target.
                    </div>
                </div>}

                {status === 'done' && <div>
                    <Lottie
                        options={done}
                        height={600}
                        width={600}
                    />

                    Done!

                    <div className="sub">Have a nice evening.</div>
                </div>}

                <div className="listening">
                    {this.state.isListening &&
                    <Lottie options={listening}
                            height={80}
                            width={80}
                    />
                    }
                </div>

                <div className="brand">RoboTender</div>
            </div>
        );
    }
}

export default App;
