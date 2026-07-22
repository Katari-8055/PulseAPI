import { useState } from 'react';
import { Terminal, BookOpen, Sparkles, Code, Check, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocsPreview() {
    const [activeTab, setActiveTab] = useState('middleware');
    const [copied, setCopied] = useState(false);

    const docSections = {
        middleware: {
            title: "1. Create monitoring.js",
            desc: "Define the reusable monitoring middleware using Axios to capture response latencies and status codes asynchronously.",
            language: "javascript",
            code: `const axios = require('axios');

const monitoringMiddleware = (options = {}) => {
    const {
        apiKey = process.env.MONITORING_API_KEY,
        endpoint = process.env.MONITORING_ENDPOINT || 'http://localhost:5000/api/hit',
        serviceName = process.env.SERVICE_NAME || 'my-service'
    } = options;

    if (!apiKey) return (req, res, next) => next();

    return (req, res, next) => {
        const startTime = Date.now();
        const originalEnd = res.end;

        res.end = function (...args) {
            const responseTime = Date.now() - startTime;

            const monitoringData = {
                serviceName,
                endpoint: req.originalUrl || req.url,
                method: req.method,
                statusCode: res.statusCode,
                latencyMs: responseTime,
                ip: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown'
            };

            // Post telemetry asynchronously
            setImmediate(() => {
                axios.post(endpoint, monitoringData, {
                    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
                    timeout: 3000
                }).catch(() => {}); // Fail silently
            });

            originalEnd.apply(res, args);
        };

        next();
    };
};

module.exports = monitoringMiddleware;`
        },
        integration: {
            title: "2. Server Integration",
            desc: "Register the custom monitoring middleware early in your server setup stack (Express.js).",
            language: "javascript",
            code: `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const monitoringMiddleware = require('./monitoring');

const app = express();

app.use(cors());
app.use(express.json());

// Apply monitoring middleware to instrument all routes
app.use(monitoringMiddleware({
    serviceName: 'blog-api'
}));

// Your API Routes
app.get('/api/posts', (req, res) => {
    res.json({ success: true, posts: [] });
});

app.listen(3002, () => console.log('API Server running on port 3002'));`
        },
        config: {
            title: "3. Environment Config",
            desc: "Configure environment variables inside your service config file (.env).",
            language: "bash",
            code: `# .env
PORT=3002

# PulseAPI telemetry keys
MONITORING_API_KEY=pl_live_9a8f2c3d4e5f6g7h8i9j
MONITORING_ENDPOINT=http://localhost:5000/api/hit
SERVICE_NAME=blog-api`
        },
        payload: {
            title: "4. JSON Telemetry Payload",
            desc: "Format structure of request hit telemetry dispatched by the client backend service.",
            language: "json",
            code: `{
    "serviceName": "blog-api",
    "endpoint": "/api/posts",
    "method": "GET",
    "statusCode": 200,
    "latencyMs": 42,
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}`
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="docs-preview" className="py-24 bg-background relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left side: List of tabs & description */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                            <BookOpen className="w-3.5 h-3.5" />
                            Developer Documentation
                        </div>
                        
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Developer-friendly by design
                        </h2>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Integrate PulseAPI into your current tech stack in under five minutes. Our SDK runs natively within server context, collecting telemetry with minimal CPU overhead.
                        </p>

                        {/* Navigation list */}
                        <div className="space-y-2 pt-4">
                            {Object.entries(docSections).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setActiveTab(key);
                                        setCopied(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                        activeTab === key
                                            ? 'bg-card border-indigo-500/30 text-foreground shadow-sm'
                                            : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                    }`}
                                >
                                    <div>
                                        <div className="text-xs font-semibold tracking-wide uppercase font-mono text-indigo-400 mb-0.5">{key}</div>
                                        <div className="text-sm font-semibold">{section.title}</div>
                                    </div>
                                    <Code className={`w-4 h-4 transition-transform duration-300 ${
                                        activeTab === key ? 'rotate-12 text-indigo-400' : 'text-slate-600'
                                    }`} />
                                </button>
                            ))}
                        </div>

                        <div className="pt-2">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 group"
                            >
                                View all SDK Docs
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Interactive Code Viewer */}
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
                            {/* Header bar */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border-b border-slate-900">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-mono font-medium text-slate-400">{docSections[activeTab].title}</span>
                                </div>
                                <button
                                    onClick={() => handleCopy(docSections[activeTab].code)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium font-mono text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Description sub-bar */}
                            <div className="px-5 py-3 border-b border-slate-900 bg-slate-900/10 text-xs text-slate-400">
                                {docSections[activeTab].desc}
                            </div>

                            {/* Pre code */}
                            <div className="p-5 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto select-all max-h-[360px]">
                                <pre className="text-indigo-200">
                                    <code>{docSections[activeTab].code}</code>
                                </pre>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
