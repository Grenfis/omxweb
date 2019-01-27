Vue.use(httpVueLoader)

var app = new Vue({
    el: '#app',
    data: {
        status: {
            running: false,
            file: '',
            name: '',
            position: '',
            duration: ''
        },
        cur_path: '',
        statUpdTimer: '',
        files: [],
        refreshDur: 2000
    },
    components: {
        "c_browser": 'url:/static/js/browser.vue',
        "c_controller": 'url:/static/js/control_panel.vue',
        "c_gmenu": 'url:/static/js/global_menu.vue'
    },
    methods: {
        get_status: function() {
            return fetch('/status')
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get status from server')
            }).then((json) => {
                this.setStatus(json)
            }).catch((error) => {
                console.log(error)
            })
        },

        get_files: function(path) {
            parent = '-1'
            try{
                p = this.files[0].parent
                parent = p
            }catch(e){
            }
            p = ''
            if (parent != path) {
                p = this.cur_path + '/'
            }

            return fetch('/browse?path=' + p + (path?path:''))
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get file list from server')
            }).then((json) => {
                this.files = json
                //directories first
                this.files.sort(function(f1, f2) {
                    if (f1.directory && !f2.directory) {
                        return -1
                    }else if(!f1.directory && f2.directory){
                        return 1
                    }else{
                        return 0
                    }
                })
                if (path) {
                    pth = ''
                    if (parent == path){
                        this.cur_path = path
                        pth = path.split('/')
                        pth.pop()
                        pth = pth.join('/')
                    }else{
                        pth = this.cur_path
                        this.cur_path += '/' + path
                    }

                    this.files.unshift({
                        'filename': '..',
                        'parent': pth,
                        'directory': true
                    })
                }else{
                    this.cur_path = ''
                }
            }).catch((error) => {
                console.log(error)
            })
        },
        setStatus: function(stat) {
            if (!stat.running && this.status.running) {
                this.get_files()
            }
            this.status = stat
        }
    },

    created: function() {
        this.get_status()
        .then(() => {
            if (!this.running) {
                this.get_files()
            }
        })
        this.statUpdTimer = setInterval(this.get_status, this.refreshDur)
    }
})
