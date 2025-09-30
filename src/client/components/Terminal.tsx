
import { For, useLiveSignal } from "@preact/signals/utils";
import { signal } from "@preact/signals-core";
import { Elysia, t } from "elysia";
import { treaty } from "@elysiajs/eden";
import { useEffect, useMemo, useState, useRef } from 'preact/hooks';
import { useSignal } from "@preact/signals";
import { apiHost } from "../utils/api";

// This exists for the sake of getting the type of the app
const fakeApp = () => new Elysia()
    .ws("/ws", {
        body: t.String(),
        response: t.String(),
        message(ws, message) {
            ws.send(message);
        },
    })
type App = ReturnType<typeof fakeApp>;

function useApp() {

    const api = useMemo(() => {
        return treaty<App>(apiHost());
    }, []);
    return api;
}

const history = signal([] as Array<string>);


export function Terminal() {

    const [historyLength, setHistoryLength] = useState(history.value.length);
    const [command, setCommand] = useState('');
    const [chatError, setChatError] = useState('');
    const historyEndRef = useRef<HTMLDivElement>(null);

    const api = useApp();
    
    const chat = useMemo(() => api.ws.subscribe(), [api, chatError]);

    useEffect(() => {
        chat.subscribe((message) => {
            console.log("got", message);
            history.value.push(message.data as unknown as string)
            setHistoryLength(history.value.length);
        });

        chat.on("open", () => {
            chat.send("list");
        });
        return () => {
            chat.close();
        }
    }, [chat])

    // Auto-scroll to bottom when history updates
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [historyLength]);

    const sendCommand = () => {
        if (!command.trim()) return; // Don't send empty commands
        
        // Add command to history with $ prefix
        history.value.push(`$ ${command}`);
        setHistoryLength(history.value.length);
        
        try {
            chat.send(command);
        } catch (err) {
            setChatError(new Date().toISOString() + " " + stringifyError(err));
        }
        setCommand('');
    }

	return (
		<div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '400px',
            maxHeight: '500px',
            background: 'rgba(26, 46, 30, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(87, 166, 78, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}>
            {/* Terminal Header */}
            <div style={{
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(87, 166, 78, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #57A64E 0%, #6BB854 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                }}>
                    💻
                </div>
                <div>
                    <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: '2px',
                    }}>
                        Server Console
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#888',
                        fontFamily: 'ui-monospace, monospace',
                    }}>
                        RCON Terminal
                    </div>
                </div>
            </div>

            {/* Terminal output area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#d4d4d4',
                background: 'rgba(0, 0, 0, 0.2)',
            }}>
                <For each={history} fallback={
                    <pre style={{ 
                        margin: 0, 
                        color: '#888',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span style={{ color: '#57A64E' }}>➜</span> Waiting for commands...
                    </pre>
                }>
                    {(item, index) => (
                        <pre 
                            hidden={index > historyLength} 
                            key={index}
                            style={{ 
                                margin: '0 0 10px 0',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: item.startsWith('$') ? '#FFB600' : '#b0e0b0',
                                padding: '6px 0',
                                borderLeft: item.startsWith('$') ? '3px solid #FFB600' : '3px solid transparent',
                                paddingLeft: '12px',
                            }}
                        >
                            {item}
                        </pre>
                    )}
                </For>
                <div ref={historyEndRef} />
            </div>

            {/* Error display */}
            {chatError && (
                <div style={{
                    padding: '12px 20px',
                    backgroundColor: 'rgba(255, 107, 107, 0.15)',
                    color: '#ff6b6b',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    borderTop: '1px solid rgba(255, 107, 107, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>⚠️</span>
                    {chatError}
                </div>
            )}

            {/* Input area */}
            <div style={{
                display: 'flex',
                gap: '10px',
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderTop: '1px solid rgba(87, 166, 78, 0.2)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#57A64E',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    marginRight: '4px',
                }}>
                    ➜
                </div>
                <input 
                    type="text" 
                    value={command} 
                    onInput={(e) => setCommand(e.currentTarget.value)} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendCommand();
                        }
                    }}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck={false}
                    placeholder="Type a command..."
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(87, 166, 78, 0.3)',
                        borderRadius: '8px',
                        color: '#e0e0e0',
                        fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(87, 166, 78, 0.6)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(87, 166, 78, 0.3)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                    }}
                />
                <button 
                    onClick={() => sendCommand()}
                    style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #57A64E 0%, #6BB854 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(87, 166, 78, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(87, 166, 78, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(87, 166, 78, 0.3)';
                    }}
                >
                    Send
                </button>
            </div>
		</div>
	);
}

function stringifyError(err: unknown): string {
    if (err instanceof Error) {
        return err.message;
    }
    return String(err);
}