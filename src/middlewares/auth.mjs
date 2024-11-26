import jwt from 'jsonwebtoken';

async function auth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).send('Yetkisiz giriş denemesi.')
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (ex) {
        res.status(400).send("Sorunlu token.")
    }
}

export default auth;