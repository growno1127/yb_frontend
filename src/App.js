import { useState,useEffect } from "react";
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
        const [search_channel, setSearchChannel] = useState(""); 
	const [text, setText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null)
    const [textContent, setTextContent] = useState("")
    const [channelName, setChannelName] = useState("");

    const extractTextFromPdf = async (file) => {
        pdfToText(file).then(text => setTextContent(text))
    }
    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const extractTextFromFile = (file) => {
        if (!file) return;
        const fileType = file.type;
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            if (fileType.includes('text/plain')) {
                setTextContent(content);
            } else if(fileType.includes("csv")) {
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
	const onSubmit = async () => {
		if (links.length === 0 ) {
			toast.warning('Please provide some links before submitting.');
			return;
		}
		setIsLoading(true);  
		try {
			const res = await fetch("http://97.107.136.225:8000/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ links, extra: textContent, channelName  }),
			});
			if (!res.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await res.json();
			if(data.message === "success"){
				toast.success(data.message);
				console.log(data)
			}else
			{
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
			console.log(search, search_channel);
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
			setText(plainText + "channel name: [" + search_channel + "]");
		} catch (error) {
			console.error("Failed to fetch data:", error);
			setText("Sorry, I don't know the answer.")
		} finally {
			setIsLoading(false); 
		}
	};

	return (
		<>
			<nav>
				<div>YouTube</div>
			</nav>
			<section>
				<div className="left">
				<ToastContainer />
		<input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="yb-input mb-16" placeholder="please input channel name..." />
					<textarea
						className="yb-textarea mb-16"
						rows={9}
						value={links}
						onChange={(e) => setLinks(e.target.value)}
						placeholder="Enter YouTube video URL"></textarea>
		<input type="file" onChange={handleFileChange} accept=".docx, .csv, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .pdf, .txt"/>
					<button className="yb-button ml-auto" onClick={onSubmit}>
						Get Transcripts
					</button>
					{isLoading && <LoadingModal />}
				</div>
				<div className="right">
					<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="yb-input mb-16" placeholder="please input keyword..."/>
					<input type="text" value={search_channel} onChange={(e) => setSearchChannel(e.target.value)} className="yb-input mb-16" placeholder="please input channel name..."/>
					<textarea className="yb-search-result" rows={7} value={text} disabled>
					</textarea>
					<Clock />
					<button className="yb-button ml-auto" onClick={onSearch}>Search</button>
				</div>
			</section>
		</>
	);
}
