import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import LoadingModal from "./componenets/LoadingModal";
import Clock from "./componenets/Clock";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext'

export default function () {
    const [links, setLinks] = useState("");
    const [search, setSearch] = useState("");
    const [channelName, setChannelName] = useState("");
    const [search_channel, setSearchChannel] = useState("");
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState(0);

    const [file, setFile] = useState(null)
    const [textContent, setTextContent] = useState("")

    const extractTextFromPdf = async (file) => {
        pdfToText(file).then(text => setTextContent(text))
    }

    const extractTextFromFile = (file) => {
        if (!file) return;
        const fileType = file.type;
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            if (fileType.includes('text/plain')) {
                setTextContent(content);
            } else if (fileType.includes("csv")) {
                setTextContent(content)
            }
            else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                mammoth.extractRawText({ arrayBuffer: content })
                    .then(function (result) {
                        setTextContent(result.value)
                    })
                    .done()
            }
        };

        if (fileType.includes('pdf')) {
            extractTextFromPdf(file)
            // reader.readAsArrayBuffer(file);
        } else if (fileType.includes('doc')) {
            reader.readAsArrayBuffer(file)
        }
        else {
            reader.readAsText(file);
        }
    }

    useEffect(() => {
        extractTextFromFile(file)
    }, [file])

    useEffect(() => {
        console.log(textContent)
    }, [textContent])

    const onSubmit = async () => {
        if (links.length === 0) {
            toast.warning('Please provide some links before submitting.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("http://97.107.136.225:8000/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ links, extra: textContent }),
            });
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await res.json();
            if (data.message === "success") {
                toast.success(data.message);
                console.log(data)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.warning('Failed to load data. Please try again later.',);
        } finally {
            setIsLoading(false);
        }
    };

    const onSearch = async () => {
        if (search.length === 0 && search_channel.length === 0) {
            toast.warning('Please provide some keywords');
            return;
        }
        setIsLoading(true);
        try {
            console.log(search);
            const res = await fetch("http://97.107.136.225:8000/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search, search_channel }),
            });
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await res.json();
            console.log(data?.choices);
            const plainText = [];
            plainText.push(data?.choices[0]?.message?.content);
            setText(plainText + "asdasda [" + search_channel + "]");
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setText("Sorry, I don't know the answer." + "asdasda [" + search_channel + "]")
        } finally {
            setIsLoading(false);
        };
        setIsLoading(true);
        try {
            console.log(search);
            const res = await fetch("http://97.107.136.225:8000/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search, search_channel }),
            });
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await res.json();
            console.log(data?.choices);
            const plainText = [];
            plainText.push(data?.choices[0]?.message?.content);
            setText(plainText);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setText("Sorry, I don't know the answer.")
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    return (
        <>
            <nav>
                <div>YouTube</div>
            </nav>
            <section>
                <div className="left">
                    <ToastContainer />
                    <form action="/submit-your-choice" method="post">
                        <label>
                            <input onChange={(e) => {setType(1)}} type="radio" name="youtube" className="yb-input"/> Video Only
                            <hr />
                            <textarea
                                disabled = {type===1?false:true}
                                className="yb-textarea mb-16"
                                rows={9}
                                value={links}
                                onChange={(e) => setLinks(e.target.value)}
                                placeholder="Enter YouTube video URL"></textarea></label>
                        <label>
                            <input onChange={(e) => {setType(2)}} type="radio" name="youtube" className="yb-input"/> Channel
                            <hr />
                            <div className="div-channel mb-16" disabled = {type===2?false:true}>
                                <input disabled = {type===2?false:true} type="text" value={channelName} onChange={(e) => setSearch(e.target.value)} className="yb-channel" placeholder="channel name..." />
                                <input disabled = {type===2?false:true} type="file" className="file-open" onChange={handleFileChange} accept=".docx, .csv, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .pdf, .txt" />
                            </div>
                            <button className="yb-button ml-auto" onClick={onSubmit}>
                                Get Transcripts
                            </button>
                            {isLoading && <LoadingModal />}</label>
                    </form>
                </div>
                <div className="right">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="yb-input mb-16" placeholder="please input keyword..." />
                    <input type="text" value={search_channel} onChange={(e) => setSearchChannel(e.target.value)} className="yb-input mb-16" placeholder="please input channel name..." />
                    <textarea className="yb-search-result" rows={7} value={text} disabled>
                    </textarea>
                    <Clock />
                    <button className="yb-button ml-auto" onClick={onSearch}>Search</button>
                </div>
            </section>
        </>
    );
}