
export async function SendGet(url, params) {
    const resp = await fetch(url + "?" + new URLSearchParams(params));
    return await parseResponse(resp);
}

export async function SendPost(url, data) {
    console.log("Data being sent:", JSON.stringify(data, null, 2));
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });    
    
    return await parseResponse(resp);
}

export async function SendUpdate(url, data) {
    const resp = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });
    return await parseResponse(resp);
}

export async function SendDelete(url, data) {
    const resp = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });
    return await parseResponse(resp);
}

async function parseResponse(resp) {
    // if (!resp.ok) {
    //     throw new Error("Network response was not OK"); 
    // }
    if (resp.status !== 200) {
        if (resp.status === 401) {
            window.location.href = "/";
        } else if (resp.status === 400){
            alert("invalid request parameter!");
            return null;
        }
    }
    const data = await resp.json();
    return data;
}