const checkSession = (req,res,next) => {
    if(req.session.user){
        next();
    }else {
        res.redirect('/user/login')
    }
}

const isNotLogin = (req,res,next) => {
    if(req.session.user){
        res.redirect('/')
    }else {
        next();
    }
}


const isCustomerAccessible = (req, res, next) => {
    if (req.session.user) {
        if (req.session.role === 'user') {
            next();
        } else {
            res.redirect('/admin/dashboard');
        }

    } else {
        next();
    }
}

const isAdminAccessible = (req, res, next) => {
    if (req.session.user && req.session.role === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = {checkSession , isNotLogin, isCustomerAccessible, isAdminAccessible}