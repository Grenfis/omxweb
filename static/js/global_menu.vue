<template>
    <nav class="navbar navbar-expand-xs navbar-dark bg-dark">
        <a class="navbar-brand" href="#">{{info.os}}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarColor02">
            <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
                <a class="nav-link" href="#" v-on:click="reboot()">Reboot</a>
            </li>
            </ul>
        </div>
    </nav>
</template>
<script>
module.exports = {
    data: function() {
        return {
            info: ''
        }
    },
    methods: {
        reboot: function() {
            fetch('/reboot')
            .then((response) => {
                if(response.ok) {
                    return
                }
                throw new Error('Can\'t get host info')
            }).catch((err) => {
                console.log(err)
            })
        }
    },
    created: function() {
        fetch('/host')
        .then((response) => {
            if(response.ok) {
                return response.json()
            }
            throw new Error('Can\'t get host info')
        }).then((json) => {
            this.info = json
        }).catch((err) => {
            console.log(err)
        })
    }
}
</script>
