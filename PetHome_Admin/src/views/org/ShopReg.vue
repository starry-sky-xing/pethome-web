<template>
    <div>
        <!--:model="shop" 数据双向绑定-->
        <!--ref="shopForm" id="shopForm",给form去一个名字-->
        <!--:rules="formRules" 校验规则-->
        <el-form :model="shop" ref="shopForm" :rules="formRules" label-position="left" label-width="100px"
                 class="demo-ruleForm login-container">
            <h3 class="title">店铺入驻</h3>
            <el-form-item prop="name" label="名称">
                <el-input type="text" v-model="shop.name" auto-complete="off" placeholder="请输入店铺名称！"></el-input>
            </el-form-item>
            <el-form-item prop="tel" label="座机">
                <el-input type="text" v-model="shop.tel" auto-complete="off" placeholder="请输入座机！"></el-input>
            </el-form-item>
            <el-form-item prop="address" label="店铺地址">
                <el-input type="text" style="width: 350px" v-model="shop.address" auto-complete="off"
                          placeholder="请输入地址！"></el-input>
            </el-form-item>

            <el-form-item prop="logo" label="店铺Logo">
                <el-upload
                        class="upload-demo"
                        action="/api/dfs/upload"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :on-success="handleSuccess"
                        :file-list="fileList"
                        list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
            </el-form-item>

            <h3>管理员信息设置</h3>
            <el-form-item prop="username" label="账号">
                <el-input type="text" v-model="shop.username" auto-complete="off" placeholder="请输入账号！"></el-input>
            </el-form-item>
            <el-form-item prop="tel" label="手机号码">
                <el-input type="text" v-model="shop.phone" auto-complete="off" placeholder="请输入电话！"></el-input>
            </el-form-item>
            <el-form-item prop="email" label="电子邮件">
                <el-input type="text" v-model="shop.email" auto-complete="off" placeholder="请输入邮件！"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码">
                <el-input type="password" v-model="shop.password" auto-complete="off" placeholder="请输入密码！"></el-input>
            </el-form-item>
            <el-form-item prop="comfirmPassword" label="确认密码">
                <el-input type="password" v-model="shop.comfirmPassword" auto-complete="off"
                          placeholder="请输入确认密码！"></el-input>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="settledIn">入驻</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
    export default {
        data() {
            var validatePass2 = (rule, value, callback) => {
                console.log(value); //确认密码
                if (value === '') {
                    callback(new Error('请再次输入密码'))
                } else if (value !== this.shop.password) {
                    callback(new Error('两次输入密码不一致!'))
                } else {
                    callback()
                }
            }
            return {
                fileList: [],
                //shop:shop 为了做数据表单校验不要嵌套对象
                shop: {
                    name: '',
                    tel: '',
                    address: '',
                    logo: '',
                    username: '',
                    phone: '',
                    email: '',
                    password: '',
                    comfirmPassword: ''
                },
                formRules: {
                    name: [
                        {required: true, message: '请输入店铺名称!', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码!', trigger: 'blur'}
                    ],
                    comfirmPassword: [
                        {required: true, validator: validatePass2, trigger: 'blur'} //自定义校验规则
                    ]
                }
            };
        },
        methods: {
            //先不管，下午说
            handleSuccess(response, file, fileList) {
                console.log("===========")
                console.log(response);
                console.log(file);
                console.log(fileList);
                this.shop.logo = response.resultObj;
            },
            //先不管，下午说
            handleRemove(file, fileList) {
                var filePath = file.response.resultObj;
                this.$http.delete("/common/fastDfs/?path=" + filePath)
                    .then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功!',
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                    })
            },
            //先不管，下午说
            handlePreview(file) {
                console.log(file);
            },
            settledIn() {
                this.$refs.shopForm.validate((valid) => {
                    //校验表单成功后才做一下操作
                    if (valid) {
                        this.$confirm('确认入驻吗？', '提示', {}).then(() => {
                            //拷贝后面对象的值到新对象,防止后面代码改动引起模型变化
                            let para = Object.assign({}, this.shop); //shop 本身这个参数里面就有店铺和管理员信息

                            // 为了后台好接收，封装一个对象放到里面
                            let admin = {
                                username: para.username,
                                phone: para.phone,
                                email: para.email,
                                password: para.password,
                                comfirmPassword: para.comfirmPassword
                            };
                            para.admin = admin;
                            //判断是否有id有就是修改,否则就是添加
                            this.$http.post("/shop/settlement", para).then((res) => {
                                if (res.data.success) {
                                    this.$message({
                                        message: '操作成功!',
                                        type: 'success'
                                    });
                                    //重置表单
                                    this.$refs['shopForm'].resetFields();
                                    //跳转登录页面
                                    this.$router.push({path: '/login'});
                                }
                                else {
                                    this.$message({
                                        message: res.data.message,
                                        type: 'error'
                                    });
                                }

                            });
                        });
                    }
                })
            }
        }
    }

</script>
<style lang="scss" scoped>
    .login-container {
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 500px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        .title {
            margin: 0px auto 40px auto;
            text-align: center;
            color: #505458;
        }
        .remember {
            margin: 0px 0px 35px 0px;
        }
    }

    .map {
        width: 100%;
        height: 300px;
    }

    .searchinput {
        width: 300px;
        box-sizing: border-box;
        padding: 9px;
        border: 1px solid #dddee1;
        line-height: 20px;
        font-size: 16px;
        height: 38px;
        color: #333;
        position: relative;
        border-radius: 4px;
    }
</style>